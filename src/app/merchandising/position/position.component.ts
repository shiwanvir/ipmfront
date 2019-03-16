import { Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
@Component({
  selector: 'app-position',
  templateUrl: './position.component.html',
  styleUrls: ['./position.component.css']
})
export class PositionComponent implements OnInit {
@ViewChild(ModalDirective) colorOptionModel: ModalDirective;

formGroup : FormGroup
modelTitle : string = "New Position"
readonly apiUrl = AppConfig.apiUrl()
appValidator : AppValidator
datatable:any = null
saveStatus = 'SAVE'

//to manage form error messages
formFields = {

  position : ''
}


  constructor(private fb:FormBuilder , private http:HttpClient ) {

   }


         ngOnInit() {

           let remoteValidationConfig = { //configuration for location code remote validation
             url:this.apiUrl + 'merchandising/position/validate?for=duplicate',
             formFields : this.formFields,
             fieldCode : 'position',
             /*error : 'Dep code already exists',*/
             data : {
               position_id : function(controls){ return controls['position_id']['value']}
             }
           }

           let basicValidator = new BasicValidators(this.http)//create object of basic validation class

           this.formGroup = this.fb.group({
             position_id: 0,
             position : [null , [Validators.required],[basicValidator.remote(remoteValidationConfig)]],

           })

           //create new validation object
           this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

           this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
             this.appValidator.validate();
           })

           this.createTable() //load data list
         }

         createTable() { //initialize datatable
            this.datatable = $('#col_opt_table').DataTable({
              autoWidth: false,
              scrollY: "500px",
              scrollCollapse: true,
              processing: true,
              serverSide: true,
              ajax: {
                   dataType : 'JSON',
                   "url": this.apiUrl + "merchandising/position?type=datatable"
               },
               columns: [
                   {
                     data: "position_id",
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

                 { data: "position" }
              ],
            });

            //listen to the click event of edit and delete buttons
            $('#col_opt_table').on('click','i',e => {
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
         saveUOM(){
           //this.appValidation.validate();
           let saveOrUpdate$ = null;
           let positionId= this.formGroup.get('position_id').value
           if(this.saveStatus == 'SAVE'){
             saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/position', this.formGroup.getRawValue())
           }
           else if(this.saveStatus == 'UPDATE'){
             saveOrUpdate$ = this.http.put(this.apiUrl + 'merchandising/position/' + positionId , this.formGroup.getRawValue())
           }

           saveOrUpdate$.subscribe(
             (res) => {
               AppAlert.showSuccess({text : res.data.message })
               this.formGroup.reset();
               this.reloadTable()
               this.colorOptionModel.hide()
            },
            (error) => {
                console.log(error)
            }
          );
         }


           edit(id) { //get payment term data and open the model
             this.http.get(this.apiUrl + 'merchandising/position/' + id )
             .pipe( map(res => res['data']) )
             .subscribe(data => {
               if(data['status'] == '1')
               {
                 this.colorOptionModel.show()
                 this.modelTitle = "Update Position"
                 this.formGroup.setValue({
                  'position_id' : data['position_id'],
                  'position' : data['position']
                 })
                 this.formGroup.get('position')
                 this.saveStatus = 'UPDATE'
               }
             })
           }

           delete(id) { //deactivate payment term
             AppAlert.showConfirm({
               'text' : 'Do you want to deactivate selected Position?'
             },
             (result) => {
               if (result.value) {
                 this.http.delete(this.apiUrl + 'merchandising/position/' + id)
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
             this.formGroup.get('position').enable()
             this.formGroup.reset();
             this.modelTitle = "New Position"
             this.saveStatus = 'SAVE'
           }

             formValidate(){ //validate the form on input blur event
               this.appValidator.validate();
             }


}
