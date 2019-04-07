import { Component, OnInit, ViewChild } from '@angular/core';
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
  selector: 'app-bom-stage',
  templateUrl: './bom-stage.component.html',
  styleUrls: ['./bom-stage.component.css']
})
export class BomStageComponent implements OnInit {

  @ViewChild(ModalDirective) bomStageModel: ModalDirective;

  formGroup : FormGroup
  modelTitle : string = "New BOM Stage"
  readonly apiUrl = AppConfig.apiUrl()
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
    bom_stage_description : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient) { }

  ngOnInit() {
    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'merchandising/bomstages/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'bom_stage_description',
      /*error : 'Dep code already exists',*/
      data : {
        bom_stage_id : function(controls){ return controls['bom_stage_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      bom_stage_id : 0,
      bom_stage_description :[null , [Validators.required,PrimaryValidators.noSpecialCharactor] , [primaryValidator.remote(remoteValidationConfig)]],
    })

      this.formValidator = new AppFormValidator(this.formGroup , { });
    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    this.createTable() //load data list
  }

  createTable() { //initialize datatable
     this.datatable = $('#bomStage_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       ajax: {
            dataType : 'JSON',
            "url": this.apiUrl + "merchandising/bomstages?type=datatable"
        },
        columns: [
            {
              data: "bom_stage_id",
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
          { data: "bom_stage_description" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#bomStage_tbl').on('click','i',e => {
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
  saveBomStage(){
    //this.appValidation.validate();
    let saveOrUpdate$ = null;
    let bomStageId = this.formGroup.get('bom_stage_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/bomstages', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'merchandising/bomstages/' + bomStageId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.bomStageModel.hide()
     },
     (error) => {
         console.log(error)
     }
   );
  }


  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'merchandising/bomstages/' + id )
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      if(data['status'] == '1')
      {
        this.bomStageModel.show()
        this.modelTitle = "Update BOM Stage"
        this.formGroup.setValue({
         'bom_stage_id' : data['bom_stage_id'],
         'bom_stage_description' : data['bom_stage_description']
        })
        this.saveStatus = 'UPDATE'
      }
    })
  }


  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected BOM Stage?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'merchandising/bomstages/' + id)
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
    this.formGroup.get('bom_stage_description').enable()
    this.formGroup.reset();
    this.modelTitle = "New BOM Stage"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }


}
