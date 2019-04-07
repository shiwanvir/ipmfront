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
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

@Component({
  selector: 'app-service-types',
  templateUrl: './service-types.component.html',
  styleUrls: [],
  providers: [ComponentLoaderFactory,PositioningService]
})
export class ServiceTypesComponent implements OnInit {

  @ViewChild(ModalDirective) serviceTypesModel: ModalDirective;

  formGroup : FormGroup
  modelTitle : string = "New Service Type"
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'

  //to manage form error messages
  formFields = {
    service_type_code : '',
    service_type_description : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient) { }

  ngOnInit() {

    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'ie/servicetypes/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'service_type_code',
      /*error : 'Dep code already exists',*/
      data : {
        service_type_id : function(controls){ return controls['service_type_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      service_type_id : 0,
      service_type_code : [null , [Validators.required],[basicValidator.remote(remoteValidationConfig)]],
      service_type_description : [null , [Validators.required]]
    })

    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    this.createTable() //load data list
  }

  createTable() { //initialize datatable
     this.datatable = $('#service_types_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       ajax: {
            dataType : 'JSON',
            "url": this.apiUrl + "ie/servicetypes?type=datatable"
        },
        columns: [
            {
              data: "service_type_id",
              orderable: false,
              width: '3%',
              render : function(data,arg,full){
                var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
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
          { data: "service_type_code" },
          { data: "service_type_description" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#service_types_tbl').on('click','i',e => {
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
  saveServiceType(){
    //this.appValidation.validate();
    let saveOrUpdate$ = null;
    let serviceTypeId = this.formGroup.get('service_type_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'ie/servicetypes', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'ie/servicetypes/' + serviceTypeId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.serviceTypesModel.hide()
     },
     (error) => {
         console.log(error)
     }
   );
  }


  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'ie/servicetypes/' + id )
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      if(data['status'] == '1')
      {
        this.serviceTypesModel.show()
        this.modelTitle = "Update Service Type"
        this.formGroup.setValue({
         'service_type_id' : data['service_type_id'],
         'service_type_code' : data['service_type_code'],
         'service_type_description' : data['service_type_description']
        })
        this.formGroup.get('service_type_code').disable()
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
        this.http.delete(this.apiUrl + 'ie/servicetypes/' + id)
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
    this.formGroup.get('service_type_code').enable()
    this.formGroup.reset();
    this.modelTitle = "New Service Type"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }

}
