import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
import {ComponentLoaderFactory} from 'ngx-bootstrap/component-loader';
import {PositioningService} from 'ngx-bootstrap/positioning';

declare var $:any;

import { AppValidator } from '../../core/validation/app-validator';

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

@Component({
  selector: 'app-garment-operation-master',
  templateUrl: './garment-operation-master.component.html',
  styleUrls: [],
  providers: [ComponentLoaderFactory,PositioningService]
})
export class GarmentOperationMasterComponent implements OnInit {

  @ViewChild(ModalDirective) garmentOperationModel: ModalDirective;

  formValidator : AppFormValidator = null
  formGroup : FormGroup
  modelTitle : string = "New Garment Operation"
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'

  //to manage form error messages
  formFields = {

    garment_operation_name : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient) { }

  ngOnInit() {
    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'ie/garment_operations/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'garment_operation_name',
      /*error : 'Dep code already exists',*/
      data : {
        garment_operation_id : function(controls){ return controls['garment_operation_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      garment_operation_id : 0,
      garment_operation_name : [null , [Validators.required],[primaryValidator.remote(remoteValidationConfig)]],
    })
    this.formValidator = new AppFormValidator(this.formGroup , {});
    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    this.createTable() //load data list
  }

  createTable() { //initialize datatable
     this.datatable = $('#garment_operation_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       ajax: {
            dataType : 'JSON',
            "url": this.apiUrl + "ie/garment_operations?type=datatable"
        },
        columns: [
            {
              data: "garment_operation_id",
              orderable: false,
              width: '3%',
              render : function(data,arg,full){
                var   str = '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';

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
          //{ data: "service_type_code" },
          { data: "garment_operation_name" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#garment_operation_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
            this.edit(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value']);
        }
     });
  }

  reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
  }


  //save and update source details
  saveGarmentOpeartion(){
    //this.appValidation.validate();
    let saveOrUpdate$ = null;
    let garmentOperationId = this.formGroup.get('garment_operation_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'ie/garment_operations', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'ie/garment_operations/' + garmentOperationId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.garmentOperationModel.hide()
     },
     (error) => {
         console.log(error)
     }
   );
  }


  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'ie/garment_operations/' + id )
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      if(data['status'] == '1')
      {
        this.garmentOperationModel.show()
        this.modelTitle = "Update Service Type"
        this.formGroup.setValue({
         'garment_operation_id' : data['garment_operation_id'],
         'garment_operation_name' : data['garment_operation_name']
        })
        this.formGroup.get('garment_operation_name').disable()
        this.saveStatus = 'UPDATE'
      }
    })
  }


  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Service Type?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'ie/garment_operations/' + id)
        .subscribe(
            (data) => {
                this.reloadTable()
            },
            (error) => {
              console.log(error)
            }
        )
      }
    })
  }


  showEvent(event){ //show event of the bs model
    this.formGroup.get('garment_operation_name').enable()
    this.formGroup.reset();
    this.modelTitle = "New Garment Operation"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }


}
