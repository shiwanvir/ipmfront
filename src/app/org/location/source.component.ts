import { Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

//import { AppValidator } from '../../core/validation/app-validator';
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
//import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

@Component({
  selector: 'app-source',
  templateUrl: './source.component.html',
  styleUrls: []
})
export class SourceComponent implements OnInit {

  @ViewChild(ModalDirective) sourceModel: ModalDirective;

  formGroup : FormGroup
  popupHeaderTitle : string = "New Source"
  apiUrl = AppConfig.apiUrl()
  formValidator : AppFormValidator
  datatable:any = null
  saveStatus = 'SAVE'
  processing : boolean = false

  constructor(private fb:FormBuilder , private http:HttpClient) { }

  ngOnInit() {

    this.initializeForm()

  }


  initializeForm(){
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'org/sources/validate?for=duplicate',
      /*formFields : this.formFields,*/
      fieldCode : 'source_code',
      error : 'Source code already exists',
      data : {
        source_id : function(controls){ return controls['source_id']['value']}
      }
    }

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      source_id : 0,
      source_code : [null , [Validators.required, PrimaryValidators.noSpecialCharactor],[primaryValidator.remote(remoteValidationConfig)]],
      source_name : [null , [Validators.required, PrimaryValidators.noSpecialCharactor]]
    })

    //create new validation object
    this.formValidator = new AppFormValidator(this.formGroup, {});
  }


  createTable() { //initialize datatable
     this.datatable = $('#source_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       ajax: {
            dataType : 'JSON',
            "url": this.apiUrl + "org/sources?type=datatable"
        },
        columns: [
            {
              data: "source_id",
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
          { data: "source_code" },
          { data: "source_name" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#source_tbl').on('click','i',e => {
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
  saveSource(){
    if(!this.formValidator.validate())//if validation faild return from the function
      return;

    this.processing = true
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Processing...','Please wait while saving data')
    let saveOrUpdate$ = null;
    let sourceId = this.formGroup.get('source_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'org/sources', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/sources/' + sourceId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        this.formGroup.reset();
        this.reloadTable()
        this.processing = false
        this.sourceModel.hide()

        setTimeout(() => {
          AppAlert.closeAlert()
          AppAlert.showSuccess({text : res.data.message })
        } , 1000)
     },
     (error) => {
       this.processing = false
       AppAlert.closeAlert()
       AppAlert.showSuccess({text : 'Process Error' })
       console.log(error)
     }
   );
  }


  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'org/sources/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
      if(data['status'] == '1') {
        this.sourceModel.show()
        this.popupHeaderTitle = "Update Source"
        this.formGroup.setValue({
         'source_id' : data['source_id'],
         'source_code' : data['source_code'],
         'source_name' : data['source_name']
        })
        this.formGroup.get('source_code').disable()
        this.saveStatus = 'UPDATE'
      }
    })
  }


  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected source?'
    },
    (result) => {
      if (result.value) {
        AppAlert.showMessage('Processing...','Please wait while deliting source')
        this.http.delete(this.apiUrl + 'org/sources/' + id)
        .subscribe(
            (data) => {
                this.reloadTable()
                AppAlert.closeAlert()
            },
            (error) => {
              AppAlert.closeAlert()
              AppAlert.showError({ text : 'Process Error' })
              console.log(error)
            }
        )
      }
    })
  }


  showEvent(event){ //show event of the bs model
    this.formGroup.get('source_code').enable()
    this.formGroup.reset();
    this.popupHeaderTitle = "New Source"
    this.saveStatus = 'SAVE'
  }



}
