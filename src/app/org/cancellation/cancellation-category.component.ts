import { Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  selector: 'app-cancellation-category',
  templateUrl: './cancellation-category.component.html',
  styleUrls: []
})
export class CancellationCategoryComponent implements OnInit {

  @ViewChild(ModalDirective) categoryModel: ModalDirective;

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Cancellation Category"
  apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable : any = null
  saveStatus = 'SAVE'


  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  //to manage form error messages
  formFields = {
    category_code : '',
    category_description : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient) { }

  ngOnInit() {
    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'org/cancellation-categories/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'category_code',
      /*error : 'Group code already exists',*/
      data : {
        category_id : function(controls){ return controls['category_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      category_id : 0,
      category_code :  [null , [Validators.required,Validators.minLength(3),PrimaryValidators.noSpecialCharactor] , [basicValidator.remote(remoteValidationConfig)]],
      category_description :[null , [Validators.required,PrimaryValidators.noSpecialCharactor]],
    })

    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);
    this.formValidator = new AppFormValidator(this.formGroup , {});

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

  //  this.createTable()

  }

  createTable() { //initialize datatable
     this.datatable = $('#category_tbl').DataTable({
     autoWidth: false,
     scrollY: "500px",
     scrollCollapse: true,
     processing: true,
     serverSide: true,
     ajax: {
          dataType : 'JSON',
          "url": this.apiUrl + "org/cancellation-categories?type=datatable"
      },
       columns: [
            {
              data: "category_id",
              render : function(data,arg,full){
                var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
                return str;
             }
           },
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
          { data: "category_code" },
          { data: "category_description" }
       ]
     });

     //listen to the click event of edit and delete buttons
     $('#category_tbl').on('click','i',e => {
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
  saveCategory(){
    //this.appValidator.validate();
    let saveOrUpdate$ = null;
    let categoryId = this.formGroup.get('category_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'org/cancellation-categories', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/cancellation-categories/' + categoryId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.categoryModel.hide()
     },
     (error) => {
         console.log(error)
     }
   );
  }

  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'org/cancellation-categories/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
      if(data['status'] == '1')
      {
        this.categoryModel.show()
        this.modelTitle = "Update Cancellation Category"
        this.formGroup.setValue({
         'category_id' : data['category_id'],
         'category_code' : data['category_code'],
         'category_description' : data['category_description']
        })
        this.formGroup.get('category_code').disable()
        this.saveStatus = 'UPDATE'
      }
    })
  }

  delete(id) { //deactivate payment
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected category?'
    },(result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'org/cancellation-categories/' + id)
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

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }

  showEvent(event){ //show event of the bs model
    this.formGroup.get('category_code').enable()
    this.formGroup.reset();
    this.modelTitle = "New Cancellation Category"
    this.saveStatus = "SAVE"
  }

}
