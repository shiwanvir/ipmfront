<?php

namespace App\Http\Controllers\Org\Location;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

use App\Http\Controllers\Controller;
use App\Models\Org\Location\Location;
use App\Models\Finance\Accounting\CostCenter;

class LocationController extends Controller
{
    public function __construct()
    {
      //add functions names to 'except' paramert to skip authentication
      $this->middleware('jwt.verify', ['except' => ['index']]);
    }

    //get Location list
    public function index(Request $request)
    {
      $type = $request->type;
      if($type == 'datatable')   {
        $data = $request->all();
        return response($this->datatable_search($data));
      }
      else if($type == 'auto')    {
        $search = $request->search;
        return response($this->autocomplete_search($search));
      }
      else {
        $active = $request->active;
        $fields = $request->fields;
        return response([
          'data' => $this->list($active , $fields)
        ]);
      }
    }


    //create a Location
    public function store(Request $request)
    {
      $location = new Location();
      if($location->validate($request->all()))
      {
        $location->fill($request->all());
				$location->status = 1;
				$location->created_by = 1;
				$result = $location->saveOrFail();
				$insertedId = $location->loc_id;

				DB::table('org_location_cost_centers')->where('loc_id', '=', $insertedId)->delete();
				$cost_centers = $request->get('cost_centers');
				$save_cost_centers = array();
				if($cost_centers != '') {
		  		foreach($cost_centers as $cost_center)		{
						array_push($save_cost_centers,CostCenter::find($cost_center['cost_center_id']));
					}
				}
				$location->costCenters()->saveMany($save_cost_centers);

        return response([ 'data' => [
          'message' => 'Location was saved successfully',
          'location' => $location
          ]
        ], Response::HTTP_CREATED );
      }
      else
      {
          $errors = $location->errors();// failure, get errors
          return response(['errors' => ['validationErrors' => $errors]], Response::HTTP_UNPROCESSABLE_ENTITY);
      }
    }


    //get a Location
    public function show($id)
    {
      $location = Location::with(['country','currency','costCenters'])->find($id);
      if($location == null)
        throw new ModelNotFoundException("Requested location not found", 1);
      else
        return response([ 'data' => $location ]);
    }


    //update a Location
    public function update(Request $request, $id)
    {
      $location = Location::find($id);
      if($location->validate($request->all()))
      {
        $location->fill($request->except('loc_code'));
        $location->save();

        DB::table('org_location_cost_centers')->where('loc_id', '=', $id)->delete();
				$cost_centers = $request->get('cost_centers');
				$save_cost_centers = array();
				if($cost_centers != '') {
		  		foreach($cost_centers as $cost_center)		{
						array_push($save_cost_centers,CostCenter::find($cost_center['cost_center_id']));
					}
				}
				$location->costCenters()->saveMany($save_cost_centers);

        return response([ 'data' => [
          'message' => 'Location was updated successfully',
          'location' => $location
        ]]);
      }
      else
      {
        $errors = $location->errors();// failure, get errors
        return response(['errors' => ['validationErrors' => $errors]], Response::HTTP_UNPROCESSABLE_ENTITY);
      }
    }


    //deactivate a Location
    public function destroy($id)
    {
      $location = Location::where('loc_id', $id)->update(['status' => 0]);
      return response([
        'data' => [
          'message' => 'Location was deactivated successfully.',
          'location' => $location
        ]
      ] , Response::HTTP_NO_CONTENT);
    }


    //validate anything based on requirements
    public function validate_data(Request $request){
      $for = $request->for;
      if($for == 'duplicate')
      {
        return response($this->validate_duplicate_code($request->Location_id , $request->Location_code));
      }
    }


    //check Location code already exists
    private function validate_duplicate_code($id , $code)
    {
      $location = Location::where('loc_code','=',$code)->first();
      if($location == null){
        return ['status' => 'success'];
      }
      else if($location->Location_id == $id){
        return ['status' => 'success'];
      }
      else {
        return ['status' => 'error','message' => 'Location code already exists'];
      }
    }


    //get filtered fields only
    private function list($active = 0 , $fields = null)
    {
      $query = null;
      if($fields == null || $fields == '') {
        $query = Location::select('*');
      }
      else{
        $fields = explode(',', $fields);
        $query = Location::select($fields);
        if($active != null && $active != ''){
          $query->where([['status', '=', $active]]);
        }
      }
      return $query->get();
    }

    //search Location for autocomplete
    private function autocomplete_search($search)
  	{
  		$location_lists = Location::select('loc_id','loc_name')
  		->where([['loc_name', 'like', '%' . $search . '%'],]) ->get();
  		return $location_lists;
  	}


    //get searched Locations for datatable plugin format
    private function datatable_search($data)
    {
      $start = $data['start'];
      $length = $data['length'];
      $draw = $data['draw'];
      $search = $data['search']['value'];
      $order = $data['order'][0];
      $order_column = $data['columns'][$order['column']]['data'];
      $order_type = $order['dir'];

      $location_list = Location::join('org_company', 'org_location.company_id', '=', 'org_company.company_id')
  		->select('org_location.*', 'org_company.company_name')
  		->where('loc_code','like',$search.'%')
  		->orWhere('loc_name', 'like', $search.'%')
  		->orWhere('company_name', 'like', $search.'%')
  		->orderBy($order_column, $order_type)
  		->offset($start)->limit($length)->get();

  		$location_count = Location::join('org_company', 'org_location.company_id', '=', 'org_company.company_id')
  		->select('org_location.*', 'org_company.company_name')
  		->where('loc_code','like',$search.'%')
  		->orWhere('loc_name', 'like', $search.'%')
  		->orWhere('company_name', 'like', $search.'%')
  		->count();
      return [
          "draw" => $draw,
          "recordsTotal" => $location_count,
          "recordsFiltered" => $location_count,
          "data" => $location_list
      ];
    }

}
