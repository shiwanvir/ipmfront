import { Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgOption } from '@ng-select/ng-select';
declare var $:any;

import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';


import {AuthService } from '../../core/service/auth.service';


@Component({
  selector: 'app-storebin',
  templateUrl: './storebin.component.html',
  styleUrls: ['./storebin.component.css']
})
export class StorebinComponent implements OnInit {

  @ViewChild(ModalDirective) binModel: ModalDirective;


  formGroup : FormGroup
  modelTitle : string = "New Bin"
  apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'
  url =  this.apiUrl + 'store/storebin'
  storeList$:Observable<Array<any>>
  subStoreList$:Observable<Array<any>>

  formFields = {
    store_bin_id: 0,
    store_id: 0,
    substore_id: 0,
    store_bin_name : '',
    store_bin_description : ''
  }

  public storeList ;

  constructor(private fb:FormBuilder , private http:HttpClient, private token:AuthService ) { }

  ngOnInit() {
    let remoteValidationConfig = { //configuration for goods type description remote validation
      url:this.url + '/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'store_bin_name',
      /*error : 'Goods type description already exists',*/
      data : {
        id : function(controls){
          return controls['store_bin_id']['value']
        },
        store_id : function(controls){
          return controls['store_id']['value']['store_id']
        },
        substore_id : function(controls){
          return controls['substore_id']['value']['substore_id']
        }
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({ // create the form
      store_bin_id : 0,
      store_id:[0 , [Validators.required]],
      substore_id:[0 , [Validators.required]],
      store_bin_name : [null , [Validators.required , Validators.minLength(2)],[basicValidator.remote(remoteValidationConfig)]],
      store_bin_description : null,
    })

    //create new validation object
    this.appValidator = new AppValidator(this.formFields,[],this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    this.createTable(); //initialize datatable

    this.storeList$ = this.getStoreList()
    this.subStoreList$ = this.getSubStoreList()
  }

  getStoreList():Observable<Array<any>>{
      return this.http.get<any[]>( this.apiUrl + 'store/stores?active=1&fields=store_id,store_name')
      .pipe( map( res => res['data']) )
  }

  getSubStoreList():Observable<Array<any>>{
      return this.http.get<any[]>( this.apiUrl + 'store/substore?active=1&fields=substore_id,substore_name')
      .pipe( map( res => res['data']) )
  }

  createTable() { //initialize datatable
     this.datatable = $('#data_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       "order": [[ 1, "asc" ]],
       ajax: {
            headers : {Authorization: `Bearer ${this.token.getToken()}`},
            dataType : 'JSON',
            "url": this.url +"?type=datatable"

        },
        columns: [
            {
              data: "store_bin_id",
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
           { data: "store_bin_name" },
           { data: "store_bin_description" },
           { data: "store_name" },
           { data: "substore_name" },
           {
             data: "status",
             render : function(data,arg,full){
               if(data == 1){
                   return '<span class="label label-success">Active</span>';
               }else{
                 return '<span class="label label-default">Inactive</span>';
               }
             }
          },
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#data_tbl').on('click','i',e => {
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
    let id = this.formGroup.get('store_bin_id').value
    let objectArr = null;


    objectArr = this.formGroup.getRawValue();
    objectArr['store_id'] = objectArr['store_id']['store_id'];
    objectArr['substore_id'] = objectArr['substore_id']['substore_id'];
    //console.log(objectArr);

    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.url, objectArr );
      saveOrUpdate$.subscribe(
        (res) => {
          AppAlert.showSuccess({text : res.data.message })
          //this.formGroup.reset();
          this.reloadTable();
          this.formGroup.controls['store_bin_name'].reset();
          this.formGroup.controls['store_bin_description'].reset();
          //this.binModel.hide()
       },
       (error) => {
           console.log(error)
       }
     );
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.url + '/' + id, objectArr );
      saveOrUpdate$.subscribe(
        (res) => {
          AppAlert.showSuccess({text : res.data.message })
          this.formGroup.reset();
          this.reloadTable();
          this.binModel.hide()
       },
       (error) => {
           console.log(error)
       }
     );
    }



  }


  edit(id) { //get payment term data and open the model
    this.http.get(this.url + '/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
      //  if(data['status'] == '1') {
          this.binModel.show()
          this.modelTitle = "Update Bin"
          this.formGroup.setValue({
           'store_bin_id' : data['store_bin_id'],
           'store_id' : data['store'],
           'substore_id' : data['substore'],
           'store_bin_name' : data['store_bin_name'],
           'store_bin_description' : data['store_bin_description']
         })
          this.saveStatus = 'UPDATE'
          this.formGroup.get('store_bin_name').disable();
          this.formGroup.get('store_id').disable()
          this.formGroup.get('substore_id').disable()

      })
  }


  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to delete selected Bin?'
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
    this.formGroup.get('store_bin_name').enable();
    this.formGroup.get('store_id').enable();
    this.formGroup.get('substore_id').enable();
    this.formGroup.reset();
    this.getStoreList();
    this.getSubStoreList();
    this.modelTitle = "New Bin"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }

  reset() {
    this.modelTitle = "New Bin"
    this.formGroup.reset();
  }

  clearName() {
      this.formGroup.controls['store_bin_name'].reset();
      this.formGroup.controls['store_bin_description'].reset();
  }

}
