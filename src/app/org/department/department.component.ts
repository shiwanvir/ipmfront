import { Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

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
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: []
})
export class DepartmentComponent implements OnInit {

  @ViewChild(ModalDirective) departmentModel: ModalDirective;

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Department"
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
    dep_code : '',
    dep_name : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient) { }

  ngOnInit() {
      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'org/departments/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'dep_code',
      /*error : 'Dep code already exists',*/
      data : {
        dep_id : function(controls){ return controls['dep_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      dep_id : 0,
      dep_code :[null , [Validators.required , Validators.minLength(3),PrimaryValidators.noSpecialCharactor], [primaryValidator.remote(remoteValidationConfig)]],
      dep_name : [null , [Validators.required,PrimaryValidators.noSpecialCharactor]],
    })
    this.formValidator = new AppFormValidator(this.formGroup ,{} )
    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    this.createTable() //load data list
  }


  createTable() { //initialize datatable
     this.datatable = $('#department_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       ajax: {
            dataType : 'JSON',
            "url": this.apiUrl + "org/departments?type=datatable"
        },
        columns: [
            {
              data: "dep_id",
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
          { data: "dep_code" },
          { data: "dep_name" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#department_tbl').on('click','i',e => {
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
  saveDepartment(){
    //this.appValidation.validate();
    let saveOrUpdate$ = null;
    let depId = this.formGroup.get('dep_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'org/departments', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/departments/' + depId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.departmentModel.hide()
     },
     (error) => {
         console.log(error)
     }
   );
  }


  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'org/departments/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
      if(data['status'] == '1')
      {
        this.departmentModel.show()
        this.modelTitle = "Update Department"
        this.formGroup.setValue({
         'dep_id' : data['dep_id'],
         'dep_code' : data['dep_code'],
         'dep_name' : data['dep_name']
        })
        this.formGroup.get('dep_code').disable()
        this.saveStatus = "UPDATE"
      }
    })
  }


  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected department?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'org/departments/' + id)
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
    this.formGroup.get('dep_code').enable()
    this.formGroup.reset();
    this.modelTitle = "New Department"
    this.saveStatus = "SAVE"
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }

}
