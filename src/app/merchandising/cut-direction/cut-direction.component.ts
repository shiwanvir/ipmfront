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
  selector: 'app-cut-direction',
  templateUrl: './cut-direction.component.html',
  styleUrls: ['./cut-direction.component.css']
})
export class CutDirectionComponent implements OnInit {


  @ViewChild(ModalDirective) cutDirectionModel: ModalDirective;
    formGroup : FormGroup
    formValidator : AppFormValidator = null
    modelTitle : string = "New Cut Direction"
    datatable:any = null
    readonly apiUrl = AppConfig.apiUrl()
    appValidator : AppValidator
    saveStatus = 'SAVE'
    processing : boolean = false
    loading : boolean = false
    loadingCount : number = 0
    initialized : boolean = false



    formFields = {
      cut_dir_description: '',
      cd_acronyms : '',
      validation_error:'',
    }

    constructor(private fb:FormBuilder , private http:HttpClient) { }

    ngOnInit() {
      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

      let remoteValidationConfig = { //configuration for location code remote validation
        url:this.apiUrl + 'merchandising/cut-direction/validate?for=duplicate',
        formFields : this.formFields,
        fieldCode : 'cut_dir_description',
        /*error : 'Dep code already exists',*/
        data : {
          cut_dir_id: function(controls){ return controls['cut_dir_id']['value']},

        }
      }


        let basicValidator = new BasicValidators(this.http)//create object of basic validation class
      this.formGroup = this.fb.group({
       cut_dir_id : 0,
       cut_dir_description : [null , [Validators.required ,Validators.minLength(3), PrimaryValidators.noSpecialCharactor], [primaryValidator.remote(remoteValidationConfig)]],
      cd_acronyms : [null , [Validators.required , PrimaryValidators.noSpecialCharactor]],
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
       this.datatable = $('#CutDirection-table').DataTable({
         autoWidth: false,
         scrollY: "500px",
         scrollCollapse: true,
         processing: true,
         serverSide: true,
         ajax: {
              dataType : 'JSON',
              "url": this.apiUrl + "merchandising/cut-direction?type=datatable"
          },
          columns: [
              {
                data: "cut_dir_id",
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
             { data: "cut_dir_description" },
             { data: "cd_acronyms" }


         ],
       });

       //listen to the click event of edit and delete buttons
       $('#CutDirection-table').on('click','i',e => {
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
      let transId = this.formGroup.get('cut_dir_id').value
      if(this.saveStatus == 'SAVE'){
        saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/cut-direction', this.formGroup.getRawValue())
      }
      else if(this.saveStatus == 'UPDATE'){
        saveOrUpdate$ = this.http.put(this.apiUrl + 'merchandising/cut-direction/' + transId , this.formGroup.getRawValue())
      }




      saveOrUpdate$.subscribe(
        (res) => {
          AppAlert.showSuccess({text : res.data.message })
          this.formGroup.reset();
          this.reloadTable()
          this.cutDirectionModel.hide()
       },
       (error) => {
           console.log(error)
       }
     );
    }

    edit(id) { //get cut direction data and open the model
      this.http.get(this.apiUrl + 'merchandising/cut-direction/' + id)
      .pipe(map( data => data['data'] ))
      .subscribe(data => {
          if(data['status'] == '1') {
            this.cutDirectionModel.show()
            this.modelTitle = "Update Cut Direction"
            this.formGroup.setValue({
             'cut_dir_id' : data['cut_dir_id'],
             'cut_dir_description' : data['cut_dir_description'],
             'cd_acronyms' : data['cd_acronyms']
            })
            this.formGroup.get('cut_dir_description')
            this.saveStatus = 'UPDATE'
          }
        })

    }
    delete(id) { //deactivate cut direction
      AppAlert.showConfirm({
        'text' : 'Do you want to deactivate selected Cut Direction?'
      },
      (result) => {
        if (result.value) {
          this.http.delete(this.apiUrl + 'merchandising/cut-direction/' + id)
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
      this.formGroup.get('cut_dir_description').enable()
      this.formGroup.reset();
      this.modelTitle = "Cut Direction"
      this.saveStatus = 'SAVE'
    }

    formValidate(){ //validate the form on input blur event
      this.appValidator.validate();
    }

}
