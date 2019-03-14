import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

//third party components
import { ModalDirective } from 'ngx-bootstrap/modal';
import {ComponentLoaderFactory} from 'ngx-bootstrap/component-loader';
import {PositioningService} from 'ngx-bootstrap/positioning';
import{BsDatepickerConfig} from 'ngx-bootstrap/datepicker';
declare var $:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';



@Component({
  selector: 'app-cost',
  templateUrl: './cost.component.html',
  styleUrls: []
})
export class CostComponent implements OnInit {

  @ViewChild(ModalDirective) costModel: ModalDirective;

  datePickerConfig: Partial<BsDatepickerConfig>;
  formGroup : FormGroup
  hisFormGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Finance Cost"
  datatable:any = null
  hisDatatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  saveStatus = 'SAVE'
  appValidator : AppValidator
  appHisValidator : AppValidator
  today : Date
  minimumDate : Date
  disable: boolean
  rowCount: number


  //to manage form error messages
  formFields = {
    finance_cost : '',
    cpmfront_end : '',
    cpum : '',
    effective_from : '',
    effective_to : ''
  }

  // hisFormFields = {
  //   finance_cost : '',
  //   cpmfront_end : '',
  //   cpum : '',
  //   effective_from : '',
  //   effective_to :''
  // }

  constructor(private fb:FormBuilder , private http:HttpClient) {
    this.minimumDate = new Date();
    this.minimumDate.setDate(this.minimumDate.getDate()-1);
    this.today = new Date();




    // this.datePickerConfig = Object.assign({},
    //   {
    //       this.today = new Date();
    //       // minDate: new Date(this.today.getDate() - 1)
    //   }
    // );
  }

  ngOnInit() {

    // let remoteValidationConfig = { //configuration for location code remote validation
    //   url:this.apiUrl + 'ie/smvupdates/validate?for=duplicate',
    //   formFields : this.formFields,
    //
    //   /*error : 'Dep code already exists',*/
    //   data : {
    //     smv_id : function(controls){ return controls['fin_cost_id']['value']},
    //   }
    // }

    // let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
       fin_cost_id : 0 ,
       fin_cost_his_id : 0 ,
       finance_cost : [null , Validators.required ],
       cpmfront_end : [null , Validators.required],
       cpum : [null , Validators.required],
       effective_from : [null, Validators.required],
       effective_to : [null , Validators.required]
    })

    // this.hisFormGroup = this.fb.group({
    //    finance_cost : [null , [Validators.required] ],
    //    cpmfront_end : [null , [Validators.required]],
    //    cpum : [null , [Validators.required]],
    //    effective_from : [null, [Validators.required]],
    //    effective_to : [null , [Validators.required] ]
    //
    // })

    this.formValidator = new AppFormValidator(this.formGroup , {});//create new validation object


    //create new validation object
    this.appValidator = new AppValidator(this.formFields,[],this.formGroup);

    // this.appHisValidator = new AppValidator(this.hisFormFields,[],this.hisFormGroup);


    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    // this.hisFormGroup.valueChanges.subscribe(data => { //validate form when form value changes
    //   this.appHisValidator.validate();
    // })



    this.createTable() //load data list
    this.createHisTable() //Load history data list
  }

  createTable() { //initialize datatable
     this.datatable = $('#cost_tbl').DataTable({
       autoWidth: true,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       ajax: {
            dataType : 'JSON',
            "url": this.apiUrl + "finance/finCost?type=datatable"
        },
        columns: [
            {
              data: "fin_cost_id",
              orderable: false,
              width: '3%',
              render : function(data,arg,full){
                var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                return str;
             }
           },
           {
             data: "status",
             orderable: false,
             render : function(data){
               if(data == 1){
                   return '<span class="label label-success">Active</span>';
               }
               else{
                 return '<span class="label label-default">Inactive</span>';
               }
             }
          },
          { data: "finance_cost"},
          { data: "cpmfront_end" },
          { data: "cpum" },
          { data: "effective_from" },
          { data: "effective_to" }
       ],
       "initComplete": (settings,json)=>{
         var table = $('#cost_tbl').dataTable();
         this.rowCount = table.fnGetData().length;
         // alert(this.rowCount);
          if(this.rowCount != 0){
              this.disable = true;
          } else {
              this.disable = false;
          }
       }

     });



     //listen to the click event of edit and delete buttons
     $('#cost_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
            this.edit(att['data-id']['value']);
        }

     });


}

createHisTable() { //initialize datatable
   this.hisDatatable = $('#cost_his_tbl').DataTable({
     autoWidth: true,
     scrollY: "500px",
     scrollCollapse: true,
     processing: true,
     serverSide: true,
     ajax: {
          dataType : 'JSON',
          "url": this.apiUrl + "finance/finCostHis?type=datatable"
      },
      columns: [

        { data: "finance_cost"},
        { data: "cpmfront_end" },
        { data: "cpum" },
        { data: "effective_from" },
        { data: "effective_to" }
     ],
   });

 }



  reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
  }

  reloadHisTable() {//reload datatable
      this.hisDatatable.ajax.reload(null, false);
  }

  //save and update source details
  saveCost(){
    //this.appValidation.validate();
    let saveOrUpdate$ = null;
    let saveOrUpdateHis$ = null;
    let finCostId = this.formGroup.get('fin_cost_id').value
    let finCostHisId = this.formGroup.get('fin_cost_his_id').value
    let formData = this.formGroup.getRawValue();
    // let hisFormData = this.hisFormGroup.getRawValue();

     // debugger

    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'finance/finCost', this.formGroup.getRawValue())
      saveOrUpdateHis$ = this.http.post(this.apiUrl + 'finance/finCostHis', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'finance/finCost/' + finCostId , this.formGroup.getRawValue())
      saveOrUpdateHis$ = this.http.put(this.apiUrl + 'finance/finCostHis/updates' , this.formGroup.getRawValue())
    }

    saveOrUpdateHis$.subscribe();
    saveOrUpdate$.subscribe(
      (res) => {
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.reloadHisTable()
        this.costModel.hide()
     },
     (error) => {
         console.log(error)
     }
   );
 }




  edit(id) { //get Finance cost data and open the model
    this.http.get(this.apiUrl + 'finance/finCost/' + id )
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      // debugger
      if(data['status'] == '1')
      {

        this.costModel.show()
        this.modelTitle = "Update Finance Cost"
        this.formGroup.setValue({

         'fin_cost_id' : data['fin_cost_id'],
         'fin_cost_his_id' : data['history'],
         'finance_cost' : data['finance_cost'],
         'cpmfront_end' : data['cpmfront_end'],
         'cpum' : data['cpum'],
         'effective_from' : data['effective_from'],
         'effective_to' : data['effective_to']


        })

        this.saveStatus = 'UPDATE'
      }
    })
  }



  showEvent(event){ //show event of the bs model

    // this.formGroup.get('validation_error').enable()
    this.formGroup.reset();
    this.modelTitle = "New Finance Cost"
    this.saveStatus = 'SAVE'

}

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }


}
