import { Component, OnInit , ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

import { AppValidator } from '../../core/validation/app-validator';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { BasicValidators } from '../../core/validation/basic-validators';

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  styleUrls: []
})
export class PaymentMethodComponent implements OnInit {

  @ViewChild(ModalDirective) paymentMethodModel: ModalDirective;

  formGroup : FormGroup
  modelTitle : string = "New Payment Method"
  apiUrl = AppConfig.apiUrl()
  appValidation : AppValidator
  datatable : any
  saveStatus = 'SAVE'

  //to manage form error messages
  formFields = {
    payment_method_code : '',
    payment_method_description : ''
  }

  constructor(private fb:FormBuilder,private http:HttpClient) { }

  ngOnInit() {

    let remoteValidationConfig = { //configuration for payment term code remote validation
      url:this.apiUrl + 'finance/accounting/payment-methods/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'payment_method_code',
      error : 'Cost center code already exists',
      data : {
        payment_method_id : function(controls){ return controls['payment_method_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({ // create the form
      payment_method_id : 0,
      payment_method_code : [null , [Validators.required , Validators.minLength(3)],[basicValidator.remote(remoteValidationConfig)]],
      payment_method_description : [null , [Validators.required]],
    })

    let customErrorMessages  = { //custom error messages
      payment_method_code : { required : 'Payment method code cannot be empty'},
      payment_method_description : { required : 'payment method description cannot be empty' }
    }

    //create new validation object
    this.appValidation = new AppValidator(this.formFields,customErrorMessages,this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      //console.log(data)
      this.appValidation.validate();
    })

    //this.createTable(); //initialize datatable

  }


  savePaymentMethod() { //save and update payment term
    //this.appValidation.validate();

    let saveOrUpdate$ = null;
    let paymentId = this.formGroup.get('payment_method_id').value;

    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'finance/accounting/payment-methods',this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'finance/accounting/payment-methods/' + paymentId,this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.paymentMethodModel.hide()
     },
     (error) => {
         console.log(error)
     }
   );
  }

  createTable() { //initialize datatable
     this.datatable = $('#tbl_payment_method').DataTable({
     autoWidth: false,
     scrollY: "500px",
     scrollCollapse: true,
     processing: true,
     serverSide: true,
     ajax: {
          dataType : 'JSON',
          "url": this.apiUrl + "finance/accounting/payment-methods?type=datatable"
      },
       columns: [
            {
              data: "payment_method_id",
              render : function(data,arg,full){
                var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
                return str;
             }
           },
           { data: "payment_method_code" },
           { data: "payment_method_description" },
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
       ]
     });

     //listen to the click event of edit and delete buttons
     $('#tbl_payment_method').on('click','i',e => {
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


  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'finance/accounting/payment-methods/' + id)
    .pipe( map(res => res['data']))
    .subscribe(data => {
      if(data['status'] == '1') {
          this.paymentMethodModel.show()
          this.modelTitle = 'Update Payment Method'
          this.formGroup.setValue({
           'payment_method_id' : data['payment_method_id'],
           'payment_method_code' : data['payment_method_code'],
           'payment_method_description' : data['payment_method_description']
          })
          this.formGroup.get('payment_method_code').disable()
          this.saveStatus = 'UPDATE'
      }
    })
  }

  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected payment method?'
    },(result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'finance/accounting/payment-methods/' + id)
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

  //show event of the bs model
  showEvent(event){
    this.formGroup.get('payment_method_code').enable()
    this.formGroup.reset();
    this.modelTitle = 'New Payment Method'
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidation.validate();
  }

}
