import { Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

@Component({
  selector: 'app-substore',
  templateUrl: './substore.component.html',
  styleUrls: ['./substore.component.css']
})
export class SubstoreComponent implements OnInit {

  @ViewChild(ModalDirective) substoreModel: ModalDirective;


  formGroup : FormGroup
  modelTitle : string = "New Sub Store"
  apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'
  url =  this.apiUrl + 'store/substore'

  formFields = {
    substore_id: 0,
    substore_name : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient) { }

  ngOnInit() {
    let remoteValidationConfig = { //configuration for goods type description remote validation
      url:this.url + '?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'substore_name',
      /*error : 'Goods type description already exists',*/
      data : {
        id : function(controls){ return controls['substore_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({ // create the form
      substore_id : 0,
      substore_name : [null , [Validators.required , Validators.minLength(3)],[basicValidator.remote(remoteValidationConfig)]]
    })

    //create new validation object
    this.appValidator = new AppValidator(this.formFields,[],this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    this.createTable(); //initialize datatable
  }



  createTable() { //initialize datatable
     this.datatable = $('#substore_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       "order": [[ 1, "asc" ]],
       ajax: {
            //headers : {Authorization: `Bearer ${this.authService.getToken()}`},
            dataType : 'JSON',
            "url": this.url +"?type=datatable"
        },
        columns: [
            {
              data: "substore_id",
              orderable: false,
              width: '10%',
              render : function(data,arg,full){
                var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
                if( full.status== 0 ) {
                  var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px;cursor:not-allowed" data-action="DISABLE"></i>';
                  str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;cursor:not-allowed" data-action="DISABLE"></i>';
                }
                return str;
             }
           },
           { data: "substore_name" },
           {
             data: "status",
             render : function(data){
               if(data == 1){
                   return '<span class="label label-success">Active</span>';
               }
               else{
                 return '<span class="label label-default">Inactive</span>';
               }
             }
          },
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#substore_tbl').on('click','i',e => {
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


  saveSubstore() { //save and update goods type
    let saveOrUpdate$ = null;
    let id = this.formGroup.get('substore_id').value

    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.url, this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.url + '/' + id,this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.substoreModel.hide()
     },
     (error) => {
         console.log(error)
     }
   );

  }


  edit(id) { //get payment term data and open the model
    this.http.get(this.url + '/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
      //  if(data['status'] == '1') {
          this.substoreModel.show()
          this.modelTitle = "Update Substore"
          this.formGroup.setValue({
           'substore_id' : data['substore_id'],
           'substore_name' : data['substore_name']
         })
          this.saveStatus = 'UPDATE'
          this.formGroup.get('substore_name').disable()
      })
  }


  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to delete selected substore?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.url + '/' + id)
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
    this.formGroup.get('substore_name').enable()
    this.formGroup.reset();
    this.modelTitle = "New Sub Store"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }

  reset() {
    this.modelTitle = "New Sub Store"
    this.formGroup.reset();
  }


}
