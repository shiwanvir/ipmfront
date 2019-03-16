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
  selector: 'app-itemlisting',
  templateUrl: './itemlisting.component.html',
  styleUrls: []
})
export class ItemlistingComponent implements OnInit {

  @ViewChild('seasonModel') seasonModel: ModalDirective;

  formGroup : FormGroup
  modelTitle : string = "Item Listing"
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'
  serverURL = AppConfig.apiServerUrl()

  //to manage form error messages
  formFields = {
    season_code : '',
    season_name : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient) { }

  ngOnInit() {

    let remoteValidationConfig = { //configuration for location code remote validation
      //url:this.apiUrl + 'org/seasons/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'season_code',
      /*error : 'Dep code already exists',*/
      data : {
         master_id : function(controls){ return controls['master_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      master_id : 0
      //season_code : [null , [Validators.required],[basicValidator.remote(remoteValidationConfig)]],
      //season_name : [null , [Validators.required]]
    })

    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    this.createTable() //load data list
  }


  createTable() { //initialize datatable
     this.datatable = $('#item_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       paging:true,
       searching:true,

       ajax: {
            dataType : 'JSON',           
            "url": this.apiUrl + "items/itemlists/loadItemList?type=datatable"
        },
        columns: [
            {
              data: "master_id",
              orderable: false,
              width: '3%',
              render : function(data,arg,full){
                var str = '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
                return str;
             }
           },           
          { data: "category_name" },
          { data: "master_description" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#item_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value']);
        }
     });
  }

  reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
  }


  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected season?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'org/seasons/' + id)
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
    this.formGroup.get('season_code').enable()
    this.formGroup.reset();
    this.modelTitle = "New Season"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }

}
