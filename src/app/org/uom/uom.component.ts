import { Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { AppValidator } from '../../core/validation/app-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

@Component({
  selector: 'app-uom',
  templateUrl: './uom.component.html',
  styleUrls: []
})
export class UomComponent implements OnInit {

  @ViewChild(ModalDirective) uomModel: ModalDirective;

  formGroup : FormGroup
  modelTitle : string = "New UOM"
  readonly apiUrl = AppConfig.apiUrl()
  formValidator : AppFormValidator = null
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'

  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  //to manage form error messages
  formFields = {
    uom_code : '',
    uom_description : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient) { }

  ngOnInit() {

    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'org/uom/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'uom_code',
      /*error : 'Dep code already exists',*/
      data : {
        uom_id : function(controls){ return controls['uom_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      uom_id : 0,
      uom_code :  [null , [Validators.required,Validators.minLength(3),PrimaryValidators.noSpecialCharactor] , [basicValidator.remote(remoteValidationConfig)]],
      uom_description :  [null , [PrimaryValidators.noSpecialCharactor] ],
    })

    this.formValidator = new AppFormValidator(this.formGroup , {});//create new validation object

    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    this.createTable() //load data list
  }


  createTable() { //initialize datatable
     this.datatable = $('#uom_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       ajax: {
            dataType : 'JSON',
            "url": this.apiUrl + "org/uom?type=datatable"
        },
        columns: [
            {
              data: "uom_id",
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
          { data: "uom_code" },
          { data: "uom_description" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#uom_tbl').on('click','i',e => {
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
  saveUOM(){
    //this.appValidation.validate();
    let saveOrUpdate$ = null;
    let uomId = this.formGroup.get('uom_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'org/uom', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/uom/' + uomId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.uomModel.hide()
     },
     (error) => {
         console.log(error)
     }
   );
  }


  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'org/uom/' + id )
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      if(data['status'] == '1')
      {
        this.uomModel.show()
        this.modelTitle = "Update UOM"
        this.formGroup.setValue({
         'uom_id' : data['uom_id'],
         'uom_code' : data['uom_code'],
         'uom_description' : data['uom_description']
        })
        this.formGroup.get('uom_code').disable()
        this.saveStatus = 'UPDATE'
      }
    })
  }


  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected uom?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'org/uom/' + id)
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
    this.formGroup.get('uom_code').enable()
    this.formGroup.reset();
    this.modelTitle = "New UOM"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }

}
