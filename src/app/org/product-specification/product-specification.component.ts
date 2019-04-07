import { Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
//third part Components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';


@Component({
  selector: 'app-product-specification',
  templateUrl: './product-specification.component.html',
  styleUrls: ['./product-specification.component.css']
})
export class ProductSpecificationComponent implements OnInit {

  @ViewChild(ModalDirective) productSpecModel: ModalDirective;

  formGroup : FormGroup
  formValidator : AppFormValidator = null
  modelTitle : string = "New Product Specification"
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  saveStatus = 'SAVE'
  processing : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  initialized : boolean = false



  formFields = {
      prod_cat_description : '',
      validation_error:''
  }

  constructor(private fb:FormBuilder,private http:HttpClient ) { }

  ngOnInit() {
  let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class
    let remoteValidationConfig={
      url:this.apiUrl + 'org/product-specification/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'validation_error',
      /*error : 'Dep code already exists',*/
      data : {
      prod_cat_id: function(controls){ return controls['prod_cat_id']['value'] },
       prod_cat_description : function(controls){if(controls['prod_cat_description']['value']!=null){ return controls['prod_cat_description']['value']}
      else
      return null;
    },


      }
    }


let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      prod_cat_id : 0,
        prod_cat_description : [null , [Validators.required , PrimaryValidators.noSpecialCharactor], [primaryValidator.remote(remoteValidationConfig)]],
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
     this.datatable = $('#prod-specification-table').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       ajax: {
            dataType : 'JSON',
            "url": this.apiUrl + "org/product-specifications?type=datatable"
        },
        columns: [
            {
              data: "prod_cat_id",
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
             { data: "prod_cat_description" }

       ],
     });

     //listen to the click event of edit and delete buttons
     $('#prod-specification-table').on('click','i',e => {
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
      let transId = this.formGroup.get('prod_cat_id').value
      if(this.saveStatus == 'SAVE'){
        saveOrUpdate$ = this.http.post(this.apiUrl + 'org/product-specifications', this.formGroup.getRawValue())
      }
      else if(this.saveStatus == 'UPDATE'){
        saveOrUpdate$ = this.http.put(this.apiUrl + 'org/product-specifications/' + transId , this.formGroup.getRawValue())
      }




      saveOrUpdate$.subscribe(
        (res) => {
          AppAlert.showSuccess({text : res.data.message })
          this.formGroup.reset();
          this.reloadTable()
          this.productSpecModel.hide()
       },
       (error) => {
           console.log(error)
       }
     );
    }

    edit(id) { //get payment term data and open the model
      this.http.get(this.apiUrl + 'org/product-specifications/' + id)
      .pipe(map( data => data['data'] ))
      .subscribe(data => {
          if(data['status'] == '1') {
            this.productSpecModel.show()
            this.modelTitle = "Update Product Specification"
            this.formGroup.setValue({
             'prod_cat_id' : data['prod_cat_id'],
             'prod_cat_description' : data['prod_cat_description']
            })
            //this.formGroup.get('trans_code').disable()
            this.saveStatus = 'UPDATE'
          }
        })

    }
    delete(id) { //deactivate payment term
      AppAlert.showConfirm({
        'text' : 'Do you want to deactivate selected Product Specification?'
      },
      (result) => {
        if (result.value) {
          this.http.delete(this.apiUrl + 'org/product-specifications/' + id)
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
      this.formGroup.get('prod_cat_id').enable()
      this.formGroup.reset();
      this.modelTitle = "New Product Specification"
      this.saveStatus = 'SAVE'
    }

    formValidate(){ //validate the form on input blur event
      this.appValidator.validate();
    }


}
