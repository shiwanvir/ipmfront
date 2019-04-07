import { Component, OnInit , ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';


import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppValidator } from '../../core/validation/app-validator';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { BasicValidators } from '../../core/validation/basic-validators';

@Component({
  selector: 'app-goods-type',
  templateUrl: './goods-type.component.html',
  styleUrls: []
})
export class GoodsTypeComponent implements OnInit {

  @ViewChild(ModalDirective) goodsTypeModel: ModalDirective;

  formGroup : FormGroup
  formGroupPopup:FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Goods Type"
  apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'

  //to manage form error messages
  formFields = {
    goods_type_description : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient) { }

  ngOnInit() {
    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
    let remoteValidationConfig = { //configuration for goods type description remote validation
      url:this.apiUrl + 'finance/goods-types/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'goods_type_description',
      /*error : 'Goods type description already exists',*/
      data : {
        goods_type_id : function(controls){ return controls['goods_type_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({ // create the form
      goods_type_id : 0,
      goods_type_description : [null , [Validators.required,Validators.minLength(3)],[primaryValidator.remote(remoteValidationConfig)]],
    })

      this.formValidator = new AppFormValidator(this.formGroup , {});//new validation object
    //create new validation object
    this.appValidator = new AppValidator(this.formFields,[],this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    this.createTable(); //initialize datatable

  }


  createTable() { //initialize datatable
     this.datatable = $('#goods_type_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       ajax: {
            //headers : {Authorization: `Bearer ${this.authService.getToken()}`},
            dataType : 'JSON',
            "url": this.apiUrl + "finance/goods-types?type=datatable"
        },
        columns: [
            {
              data: "goods_type_id",
              orderable: false,
              width: '3%',
              render : function(data,arg,full){
                var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
                return str;
             }
           },
           { data: "goods_type_description" },
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
          }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#goods_type_tbl').on('click','i',e => {
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


  saveGoodsType() { //save and update goods type
    let saveOrUpdate$ = null;
    let goodsTypeId = this.formGroup.get('goods_type_id').value

    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'finance/goods-types',this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'finance/goods-types/' + goodsTypeId,this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.goodsTypeModel.hide()
     },
     (error) => {
         console.log(error)
     }
   );

  }


  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'finance/goods-types/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
        if(data['status'] == '1') {
          this.goodsTypeModel.show()
          this.modelTitle = "Update Goods Type"
          this.formGroup.setValue({
           'goods_type_id' : data['goods_type_id'],
           'goods_type_description' : data['goods_type_description']
          })
          this.formGroup.get('goods_type_description').disable()
          this.saveStatus = 'UPDATE'
        }
      })
  }


  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected goods type?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'finance/goods-types/' + id)
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
    this.formGroup.get('goods_type_description').enable()
    this.formGroup.reset();
    this.modelTitle = "New Goods Type"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }


}
