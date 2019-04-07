import { Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

@Component({
  selector: 'app-tarnsaction',
  templateUrl: './tarnsaction.component.html',
  styleUrls: ['./tarnsaction.component.css']
})


export class TarnsactionComponent implements OnInit {

@ViewChild(ModalDirective) transactionModel: ModalDirective;
  formValidator : AppFormValidator = null
  formGroup : FormGroup
  modelTitle : string = "New Transaction"
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  saveStatus = 'SAVE'



  formFields = {
    trans_code: '',
    trans_description : '',
    validation_error :''
  }

  constructor(private fb:FormBuilder , private http:HttpClient) { }

  ngOnInit() {

      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
    let remoteValidationConfig={
      url:this.apiUrl + 'finance/transaction/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'trans_code',
      /*error : 'Dep code already exists',*/
      data : {
      trans_id: function(controls){ return controls['trans_id']['value'] },
      /* trans_code: function(controls){if(controls['trans_code']['value']!=null){ return controls['trans_code']['value']}
      else
      return null;
    },
      trans_description : function(controls){ if(controls['trans_description']['value']!=null){return controls['trans_description']['value']}
        else
        return null;
      }*/

      }
    }

let basicValidator = new BasicValidators(this.http)//create object of basic validation class

this.formGroup = this.fb.group({
  trans_id : 0,
  trans_code :[null , [Validators.required,Validators.minLength(3)],[primaryValidator.remote(remoteValidationConfig)]],
  trans_description : [null , [Validators.required,PrimaryValidators.noSpecialCharactor]],
})

this.formValidator = new AppFormValidator(this.formGroup , {});
//create new validation object
this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
  this.appValidator.validate();
})

this.createTable()


    }







  createTable() { //initialize datatable
     this.datatable = $('#transaction-table').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       ajax: {
            dataType : 'JSON',
            "url": this.apiUrl + "finance/transaction?type=datatable"
        },
        columns: [
            {
              data: "trans_id",
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
           { data: "trans_code" },
           { data: "trans_description" }


       ],
     });

     //listen to the click event of edit and delete buttons
     $('#transaction-table').on('click','i',e => {
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
  saveTm(){
    //this.appValidation.validate();
    let saveOrUpdate$ = null;
    let transId = this.formGroup.get('trans_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'finance/transaction', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'finance/transaction/' + transId , this.formGroup.getRawValue())
    }




    saveOrUpdate$.subscribe(
      (res) => {
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.transactionModel.hide()
     },
     (error) => {
         console.log(error)
     }
   );
  }

  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'finance/transaction/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
        if(data['status'] == '1') {
          this.transactionModel.show()
          this.modelTitle = "Update Transaction"
          this.formGroup.setValue({
           'trans_id' : data['trans_id'],
           'trans_code' : data['trans_code'],
           'trans_description' : data['trans_description']
          })
          this.formGroup.get('trans_code').disable()
          this.saveStatus = 'UPDATE'
        }
      })

  }
  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected transaction?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'finance/transaction/' + id)
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
    this.formGroup.get('trans_code').enable()
    this.formGroup.reset();
    this.modelTitle = "New Transaction"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }


}
