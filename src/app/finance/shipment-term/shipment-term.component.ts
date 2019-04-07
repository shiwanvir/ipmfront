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
  selector: 'app-shipment-term',
  templateUrl: './shipment-term.component.html',
  styleUrls: []
})
export class ShipmentTermComponent implements OnInit {

    @ViewChild(ModalDirective) shipTermModel: ModalDirective;

    formGroup : FormGroup
    formValidator : AppFormValidator = null
    modelTitle : string = "New Ship Term"
    apiUrl = AppConfig.apiUrl()
    appValidator : AppValidator
    datatable:any = null
    saveStatus = 'SAVE'

    processing : boolean = false
    loading : boolean = false
    loadingCount : number = 0
    initialized : boolean = false

    //to manage form error messages
    formFields = {
      ship_term_code : '',
      ship_term_description : ''
    }

    constructor(private fb:FormBuilder , private http:HttpClient) { }

    ngOnInit() {
      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

      let remoteValidationConfig = { //configuration for goods type description remote validation
        url:this.apiUrl + 'finance/ship-terms/validate?for=duplicate',
        formFields : this.formFields,
        fieldCode : 'ship_term_code',
        /*error : 'Goods type description already exists',*/
        data : {
          ship_term_id : function(controls){ return controls['ship_term_id']['value']}
        }
      }

      let basicValidator = new BasicValidators(this.http)//create object of basic validation class

      this.formGroup = this.fb.group({ // create the form
        ship_term_id : 0,
        ship_term_code :  [null , [Validators.required,Validators.minLength(3)],[primaryValidator.remote(remoteValidationConfig)]],
        ship_term_description : [null , [Validators.required,PrimaryValidators.noSpecialCharactor]]
      })
        this.formValidator = new AppFormValidator(this.formGroup , {});
      //create new validation object
      this.appValidator = new AppValidator(this.formFields,[],this.formGroup);

      this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
        this.appValidator.validate();
      })

      this.createTable(); //initialize datatable

    }


    createTable() { //initialize datatable
       this.datatable = $('#ship_term_tbl').DataTable({
         autoWidth: false,
         scrollY: "500px",
         scrollCollapse: true,
         processing: true,
         serverSide: true,
         ajax: {
              //headers : {Authorization: `Bearer ${this.authService.getToken()}`},
              dataType : 'JSON',
              "url": this.apiUrl + "finance/ship-terms?type=datatable"
          },
          columns: [
              {
                data: "ship_term_id",
                orderable: false,
                width: '3%',
                render : function(data,arg,full){
                  var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                  str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
                  return str;
               }
             },
             { data: "ship_term_code" },
             { data: "ship_term_description" },
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
       $('#ship_term_tbl').on('click','i',e => {
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


    saveShipTerm() { //save and update goods type
      let saveOrUpdate$ = null;
      let shipTermId = this.formGroup.get('ship_term_id').value

      if(this.saveStatus == 'SAVE'){
        saveOrUpdate$ = this.http.post(this.apiUrl + 'finance/ship-terms',this.formGroup.getRawValue())
      }
      else if(this.saveStatus == 'UPDATE'){
        saveOrUpdate$ = this.http.put(this.apiUrl + 'finance/ship-terms/' + shipTermId,this.formGroup.getRawValue())
      }

      saveOrUpdate$.subscribe(
        (res) => {
          AppAlert.showSuccess({text : res.data.message })
          this.formGroup.reset();
          this.reloadTable()
          this.shipTermModel.hide()
       },
       (error) => {
           console.log(error)
       }
     );

    }


    edit(id) { //get payment term data and open the model
      this.http.get(this.apiUrl + 'finance/ship-terms/' + id)
      .pipe(map( data => data['data'] ))
      .subscribe(data => {
          if(data['status'] == '1') {
            this.shipTermModel.show()
            this.modelTitle = "Update Ship Term"
            this.formGroup.setValue({
             'ship_term_id' : data['ship_term_id'],
             'ship_term_code' : data['ship_term_code'],
             'ship_term_description' : data['ship_term_description']
            })
            this.formGroup.get('ship_term_code').disable()
            this.saveStatus = 'UPDATE'
          }
        })
    }


    delete(id) { //deactivate payment term
      AppAlert.showConfirm({
        'text' : 'Do you want to deactivate selected shipment term?'
      },
      (result) => {
        if (result.value) {
          this.http.delete(this.apiUrl + 'finance/ship-terms/' + id)
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
      this.formGroup.get('ship_term_code').enable()
      this.formGroup.reset();
      this.modelTitle = "New Shipment Term"
      this.saveStatus = 'SAVE'
    }

    formValidate(){ //validate the form on input blur event
      this.appValidator.validate();
    }


  }
