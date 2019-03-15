import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { map } from 'rxjs/operators';

//third party components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

@Component({
  selector: 'app-assignproperties',
  templateUrl: './assignproperties.component.html',
  styleUrls: []
})
export class AssignpropertiesComponent implements OnInit {

  @ViewChild(ModalDirective) model_new_properties: ModalDirective;
  //@ViewChild(ModalDirective) model_assignproperties: ModalDirective;

  formGroup:FormGroup = null
  modelTitle : string = "New Property"
  serverURL = AppConfig.apiServerUrl()
  datatable:any = null


  mainCategory$ : Observable<any[]>
  subCategory$ : Observable<any[]>
  unassignProperties$ : Observable<any[]>
  assignProperties$: Observable<any[]>

  formFields = {
    category_code : '-1',
    sub_category_code : '-1',
    property_name : ''

  }

  constructor(private fb:FormBuilder, private http:HttpClient) { }

  ngOnInit() {

    this.formGroup = this.fb.group({
      category_code : -1,
      sub_category_code : -1,
      property_name : [null, [Validators.required]]

    });

    this.loadMainCategoryList();

  }


  PopUpAssignProperties(){
    this.model_new_properties.show();
  }

  loadMainCategoryList(){
    this.mainCategory$ = this.http.get<any[]>(this.serverURL + "finance/item/maincategorylist").pipe(map(res => res));
  }

  loadSubCategory(mainCode){
    this.subCategory$ = this.http.get<any[]>(this.serverURL + 'finance/item/get-subcatby-maincat', {params:{'category_id':mainCode}}).pipe(map(subres => subres));
    //console.log(this.subCategory$);
  }

  loadUnAssignProperties(subCatCode){
    this.unassignProperties$ = this.http.get<any[]>(this.serverURL + 'itemproperty/load-unassign-bysubcat',{params:{'subcategory_code':subCatCode}}).pipe(map(res=>res));
    this.loadAssignProperties(subCatCode);
  }

  loadAssignProperties(subCatCode){
    this.assignProperties$ = this.http.get<any[]>(this.serverURL + 'itemproperty/load-assign-properties',{params:{'subcategory_code':subCatCode}}).pipe(map(res=>res));
  }

  assignProperty(){
    $("#multiselect1 option:selected").remove().appendTo("#multiselect1_to");
  }

  unAssignProperty(){
    $("#multiselect1_to option:selected").remove().appendTo("#multiselect1");
  }

  moveUP(){

    var selected = $("#multiselect1_to").find(":selected");
    var before = selected.prev();
    if(before.length > 0)
        selected.detach().insertBefore(before);
  }

  moveDown(){
    var selected = $("#multiselect1_to").find(":selected");
    var next = selected.next();
    if(next.length > 0)
        selected.detach().insertAfter(next);
 }

  saveNewProperty(){



    // Check property exist before save
    // ================================
    var _propertyName = this.formGroup.controls['property_name'].value;
    this.http.get(this.serverURL + "itemproperty/check_property",{params:{"property_name":_propertyName}})
    .subscribe(val=>{
        if(val['recordscount']>0){
            AppAlert.showWarning({title:"Property name already exist in the system"});
        }else{

            this.http.post(this.serverURL + 'itemproperty/save_itemproperty',this.formGroup.getRawValue())
            .subscribe(data=>{
              if(data['status'] == 'success'){
                AppAlert.showSuccess({text: data['message']});
                this.formGroup.reset();
                this.loadUnAssignProperties($("#sub_category_code").val());
                this.model_new_properties.hide();

              }
            })

        }
    });
    // ==================================


  }

  saveNewAssignProperties(){

    var iSequenceNo = 0;
    var arrayProeprties = [];
    var _subCode = $("#sub_category_code").val();
    var _catCode = $("#category_code").val();


    // Validating main category before save the the properties
    // =======================================================
    if(_catCode == '-1'){
        AppAlert.showWarning({title:"Select Main Category from list"});return;
    }

    // Validating sub-category before save the the properties
    // =======================================================
    if(_subCode == '-1'){
        AppAlert.showWarning({title:"Select Sub Category from list"});return;
    }


    $("#multiselect1_to option").each(function(i){
      var proprtyId = $(this).val();

      iSequenceNo++;

      arrayProeprties.push({"property_id":proprtyId, "subcategory_code":_subCode, "sequence_no":iSequenceNo});
    });

    // Varify any properties assign in the assign list
    // ================================================
    if(iSequenceNo == 0){
        AppAlert.showWarning({title:"There are no any items, in the assign list"});return;
    }

    // Remove assign properties from table
    // ===================================
    //this.http.post(this.serverURL + 'itemproperty/delete-assign',{"sub_code":_subCode}).subscribe();

    for(var i=0; i<arrayProeprties.length; i++){
      this.http.post(this.serverURL + 'itemproperty/save-assign',arrayProeprties[i]).subscribe();

    }
    AppAlert.showSuccess({text: "Successfully Updated"});
  }




}
