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
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: []
})
export class SectionComponent implements OnInit {

  @ViewChild(ModalDirective) sectionModel: ModalDirective;

  formGroup : FormGroup
  modelTitle : string = "New Section"
  apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
    formValidator : AppFormValidator = null
  datatable:any = null
  saveStatus = 'SAVE'
  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false

  //to manage form error messages
  formFields = {
    section_code : '',
    section_name : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient) { }

  ngOnInit() {
  let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'org/sections/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'section_code',
      /*error : 'Dep code already exists',*/
      data : {
        section_id : function(controls){ return controls['section_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class



    this.formGroup = this.fb.group({
      section_id : 0,
      section_code :[null , [Validators.required , Validators.minLength(3),PrimaryValidators.noSpecialCharactor], [primaryValidator.remote(remoteValidationConfig)]],
      section_name :[null , [Validators.required,PrimaryValidators.noSpecialCharactor]],
    })

    this.formValidator = new AppFormValidator(this.formGroup , {});//form validation class

    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    this.createTable() //load data list
  }


  createTable() { //initialize datatable
     this.datatable = $('#section_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       ajax: {
            dataType : 'JSON',
            "url": this.apiUrl + "org/sections?type=datatable"
        },
        columns: [
            {
              data: "section_id",
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
          { data: "section_code" },
          { data: "section_name" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#section_tbl').on('click','i',e => {
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
  saveSection(){
    //this.appValidation.validate();
    let saveOrUpdate$ = null;
    let sectionId = this.formGroup.get('section_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'org/sections', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/sections/' + sectionId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.sectionModel.hide()
     },
     (error) => {
         console.log(error)
     }
   );
  }


  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'org/sections/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
      if(data['status'] == '1')
      {
        this.sectionModel.show()
        this.modelTitle = "Update Section"
        this.formGroup.setValue({
         'section_id' : data['section_id'],
         'section_code' : data['section_code'],
         'section_name' : data['section_name']
        })
        this.formGroup.get('section_code').disable()
        this.saveStatus = 'UPDATE'
      }
    })
  }


  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected section?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'org/sections/' + id)
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
    this.formGroup.get('section_code').enable()
    this.formGroup.reset();
    this.modelTitle = "New Section"
    this.saveStatus = "SAVE"
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }

}
