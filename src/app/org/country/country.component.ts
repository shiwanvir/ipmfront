import { Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';


//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';


@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: []
})
export class CountryComponent implements OnInit {

  @ViewChild(ModalDirective) countryModel: ModalDirective;
  formValidator : AppFormValidator = null
  formGroup : FormGroup
  modelTitle : string = "New Country"
  readonly apiUrl = AppConfig.apiUrl()
  saveStatus = 'SAVE'
  appValidator : AppValidator
  datatable:any = null

  //to manage form error messages
  formFields = {
    country_code : '',
    country_description : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient) { }

  ngOnInit() {
    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'org/countries/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'country_code',
      /*error : 'Dep code already exists',*/
      data : {
        country_id : function(controls){ return controls['country_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      country_id : 0,
      country_code :  [null , [Validators.required,Validators.minLength(3)],[primaryValidator.remote(remoteValidationConfig)]],
      country_description :  [null , [Validators.required,PrimaryValidators.noSpecialCharactor]],
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
     this.datatable = $('#country_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       ajax: {
            //headers : {Authorization: `Bearer ${this.authService.getToken()}`},
            dataType : 'JSON',
            "url": this.apiUrl + "org/countries?type=datatable"
        },
        columns: [
            {
              data: "country_id",
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
          { data: "country_code" },
          { data: "country_description" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#country_tbl').on('click','i',e => {
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
  saveCountry(){
    //this.appValidation.validate();
    let saveOrUpdate$ = null;
    let countryId = this.formGroup.get('country_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'org/countries',this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/countries/' + countryId,this.formGroup.getRawValue())
    }

    saveOrUpdate$
    .pipe( map(res => res['data']) )
    .subscribe(
      data => {
        AppAlert.showSuccess({text : data['message'] })
        this.formGroup.reset();
        this.reloadTable()
        this.countryModel.hide()
      },
      error => {
          console.log(error)
      }
  );

  }


  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'org/countries/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
        if(data['status'] == '1') {
          this.countryModel.show()
          this.modelTitle = "Update Country"
          this.formGroup.setValue({
           'country_id' : data['country_id'],
           'country_code' : data['country_code'],
           'country_description' : data['country_description']
          })
          this.formGroup.get('country_code').disable()
          this.saveStatus = 'UPDATE'
        }
      })

  }


  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected country?'
    },
    (result) => {
      if (result.value) {
        //let data = {'country_id' : id , 'status' : '0'}
        this.http.delete(this.apiUrl + 'org/countries/' + id/*,{ params : data }*/)
        .subscribe(data => {
            this.reloadTable()
        })
      }
    })
  }


  showEvent(event){ //show event of the bs model
    this.formGroup.get('country_code').enable()
    this.formGroup.reset();
    this.modelTitle = "New Country"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }

}
