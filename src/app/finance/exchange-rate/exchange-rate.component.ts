import { Component, OnInit , ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgOption } from '@ng-select/ng-select';
declare var $:any;

import { AppValidator } from '../../core/validation/app-validator';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import { BasicValidators } from '../../core/validation/basic-validators';


//models
import { Currency } from '../../org/models/currency.model';

@Component({
  selector: 'app-exchange-rate',
  templateUrl: './exchange-rate.component.html',
  styleUrls: []
})
export class ExchangeRateComponent implements OnInit {

  @ViewChild(ModalDirective) goodsTypeModel: ModalDirective;

  formGroup : FormGroup
  modelTitle : string = "New Exchange rate"
  apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'

  currency$: Observable<Currency[]> //use to load currency list in ng-select
  currencyLoading = false;
  currencyInput$ = new Subject<string>();
  selectedCurrency: Currency[] = <any>[];

  //to manage form error messages
  formFields = {
    currency : '',
    valid_from : '',
    rate : '',
    validation_error : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient) { }

  ngOnInit() {

    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'finance/exchange-rates/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'validation_error',
      data : {
        id : function(controls){ return controls['id']['value'] },
        valid_from : function(controls){ return new Date(controls['valid_from']['value']).toISOString() },
        currency : function(controls){ return controls['currency']['value']['currency_id'] }
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({ // create the form
      id : 0,
      currency : [null , [Validators.required] , [basicValidator.remote(remoteValidationConfig)]],
      valid_from : [null , [Validators.required] , [basicValidator.remote(remoteValidationConfig)]],
      rate : [null , [Validators.required] ]
    })

    //create new validation object
    this.appValidator = new AppValidator(this.formFields,[],this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    this.createTable(); //initialize datatable

    this.loadCurrency()

  }


  createTable() { //initialize datatable
     this.datatable = $('#rate_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       ajax: {
            //headers : {Authorization: `Bearer ${this.authService.getToken()}`},
            dataType : 'JSON',
            "url": this.apiUrl + "finance/exchange-rates?type=datatable"
        },
        columns: [
            {
              data: "id",
              orderable: false,
              width: '3%',
              render : function(data,arg,full){
                var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
                return str;
             }
           },
           { data: "currency_code" },
           { data: "valid_from" },
           { data: "rate" },
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
     $('#rate_tbl').on('click','i',e => {
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
    let rateId = this.formGroup.get('id').value
    let formData = this.formGroup.getRawValue()
    formData['currency'] = formData['currency']['currency_id']

    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'finance/exchange-rates',formData)
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'finance/exchange-rates/' + rateId,formData)
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
    this.http.get(this.apiUrl + 'finance/exchange-rates/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
        if(data['status'] == '1') {
          this.goodsTypeModel.show()
          this.modelTitle = "Update Exchange Rate"
          this.formGroup.setValue({
           'id' : data['id'],
           'currency' : data['currency'],
           'valid_from' : new Date(data['valid_from']),
           'rate' : data['rate']
          })
          this.saveStatus = 'UPDATE'
        }
      })
  }


  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected exchange rate?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'finance/exchange-rates/' + id)
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


  //load currency list
  loadCurrency() {
       this.currency$ = this.currencyInput$
       .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          tap(() => this.currencyLoading = true),
          switchMap(term => this.http.get<Currency[]>(this.apiUrl + 'finance/currencies?type=auto',{params:{search:term}})
           .pipe(
              //catchError(() => of([])), // empty list on error
              tap(() => this.currencyLoading = false)
          ))
       );
   }

  showEvent(event){ //show event of the bs model
    this.formGroup.reset();
    this.modelTitle = "New Exchange Rate"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }


}
