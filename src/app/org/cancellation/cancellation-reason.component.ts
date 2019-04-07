import { Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import { Observable } from 'rxjs';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

//model
import { CancellationCategory } from '../models/cancellation_category.model';

@Component({
  selector: 'app-cancellation-reason',
  templateUrl: './cancellation-reason.component.html',
  styleUrls: []
})
export class CancellationReasonComponent implements OnInit {

  @ViewChild(ModalDirective) reasonModel: ModalDirective;

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Reason"
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  category$ : Observable<CancellationCategory>
  saveStatus = 'SAVE'


  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  //to manage form error messages
  formFields = {
    reason_code : '',
    reason_description : '',
    reason_category : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient) { }

  ngOnInit() {

    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'org/cancellation-reasons/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'reason_code',
      data : {
        reason_id : function(controls){ return controls['reason_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      reason_id : 0,
      reason_code :[null , [Validators.required,Validators.minLength(3),PrimaryValidators.noSpecialCharactor] , [basicValidator.remote(remoteValidationConfig)]],
      reason_description :[null , [Validators.required,PrimaryValidators.noSpecialCharactor] ],
      reason_category :  [null , [Validators.required,PrimaryValidators.noSpecialCharactor] ]
    })
    this.formValidator = new AppFormValidator(this.formGroup , {});//creating new validation object
    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    //this.createTable() //load data list
    this.loadCancellationCategoryList()
  }


  createTable() { //initialize datatable
     this.datatable = $('#reason_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       ajax: {
            dataType : 'JSON',
            "url": this.apiUrl + "org/cancellation-reasons?type=datatable"
        },
        columns: [
            {
              data: "reason_id",
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
          { data: "reason_code" },
          { data: "category_description" },
          { data: "reason_description" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#reason_tbl').on('click','i',e => {
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
  saveReason(){
    //this.appValidation.validate();
    let saveOrUpdate$ = null;
    let reasonId = this.formGroup.get('reason_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'org/cancellation-reasons', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/cancellation-reasons/' + reasonId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.reasonModel.hide()
     },
     (error) => {
         console.log(error)
     }
   );
  }


  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'org/cancellation-reasons/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
      if(data['status'] == '1') {
        this.reasonModel.show()
        this.modelTitle = "Update Reason"
        this.formGroup.setValue({
         'reason_id' : data['reason_id'],
         'reason_code' : data['reason_code'],
         'reason_description' : data['reason_description'],
         'reason_category' : data['reason_category']
        })
        this.formGroup.get('reason_code').disable()
        this.saveStatus = 'UPDATE'
      }
    })
  }


  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected reason?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'org/cancellation-reasons/' + id)
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


  loadCancellationCategoryList()
  {
    this.category$ = this.http.get<CancellationCategory>(this.apiUrl + 'org/cancellation-categories?active=1&fields=category_id,category_description')
    .pipe( map(res => res['data']) )
  }


  showEvent(event){ //show event of the bs model
    this.formGroup.get('reason_code').enable()
    this.formGroup.reset();
    this.modelTitle = "New Reason"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }

}
