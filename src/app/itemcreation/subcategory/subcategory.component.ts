import { Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
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
  selector: 'app-subcategory',
  templateUrl: './subcategory.component.html',
  styleUrls: []
})
export class SubcategoryComponent implements OnInit {

    @ViewChild(ModalDirective) model_sub_category: ModalDirective;

    formGroup:FormGroup
    formValidator : AppFormValidator = null
    modelTitle : string = "New Sub Category"
    readonly apiUrl = AppConfig.apiUrl()
    serverUrl = AppConfig.apiServerUrl()
    appValidator : AppValidator
    datatable:any = null
    saveStatus = 'SAVE'

    mainCategory$ : Observable<any[]>

    //to manage form error messages
    formFields = {

      category_code : '',
      subcategory_code: '',
      subcategory_name : '',
      is_display:'',
      is_inspectiion_allowed:'',
      validation_error:''
    }

  constructor(private fb:FormBuilder , private http:HttpClient) { }

  ngOnInit() {

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'finance/subcategory/validate',
      formFields : this.formFields,
      fieldCode :'subcategory_code',
      //error : 'Dep code already exists',
      data : {
        subcategory_id : function(controls){ return controls['subcategory_id']['value']}
      }

    }


   let basicValidator = new BasicValidators(this.http)//create object of basic validation class
    this.formGroup = this.fb.group({
      subcategory_id:0,
      category_code : [null, [Validators.required]],
      subcategory_code :  [null , [Validators.required,Validators.minLength(3)],[primaryValidator.remote(remoteValidationConfig)]],
      subcategory_name: [null , [PrimaryValidators.noSpecialCharactor] ],
      is_display:[null],
      is_inspectiion_allowed:[null]
    });

    this.formValidator = new AppFormValidator(this.formGroup , {});


    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(
      data => { this.appValidator.validate();
    });

    this.loadMainCategoryList();

    this.createTable();



  }

    LoadPopUp(){
      this.model_sub_category.show();
      //$('#model_sub_category').modal('show');
      //$("#sub_category_form :input").val('');
      //$(':checkbox').prop('checked', false);
      //$("#sub_category_code").prop('disabled', false);

      $('#btn_save').html('<b><i class="icon-floppy-disk"></i></b> Save');
    }






   createTable() { //initialize datatable
     var data = [];
     this.datatable = $('#tbl_sub_category').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       ajax: {
            dataType : 'JSON',
            "url": this.serverUrl + "finance/item/subcategorylist",
        },
        columns: [
            {
              data: "subcategory_id",
              orderable: false,
              width: '3%',
              render : function(data,arg,full){

                var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'">\n\
</i>  <i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
                return str;
             }
           },
           { data: "subcategory_code" },
           { data: "subcategory_name" },
           { data: "category_name" },
           {
              data: "is_inspectiion_allowed",
              render : function(data){
                if(data == 1){
                    return '<span class="label label-success">Yes</span>';
                }
                else{
                  return '<span class="label label-default">No</span>';
                }
              }
            },
            {
              data: "is_display",
              render : function(data){
                if(data == 1){
                    return '<span class="label label-success">Yes</span>';
                }
                else{
                  return '<span class="label label-default">No</span>';
                }
              }
            }
            /*
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
           }*/
       ],
       columnDefs: [{
            orderable: false,
            width: '100px',
            targets: [ 0 ]
        }],
        /*data: dataSet,
	dom: '<"datatable-header"fl><"datatable-scroll"t><"datatable-footer"pi>'*/
     });

     //listen to the click event of edit and delete buttons
     $('#tbl_sub_category').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
            this.edit(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value']);
        }
     });
  }

  edit(id) { //get payment term data and open the model
    this.http.get(this.serverUrl + 'finance/item/get',{ params : {'subcategory_id' : id }})
    .subscribe(data => {
      this.model_sub_category.show()
      this.modelTitle = "Update Sub Category"
      this.formGroup.setValue({
       'subcategory_id' : data['subcategory_id'],
       'subcategory_code' : data['subcategory_code'],
       'category_code' : data['category_id'],
       'subcategory_name' : data['subcategory_name'],
       'is_display' : data['is_display'],
       'is_inspectiion_allowed' : data['is_inspectiion_allowed']
      })
      this.formGroup.get('subcategory_code').disable()
    })
  }

  delete(id){
    AppAlert.showConfirm({
      'text':'Do you need remove selected subcategory? '
    },
    (result) => {
      if(result.value){
        let data = {'subcategory_id':id, 'status' : '0'}
        this.http.get(this.serverUrl + 'finance/item/sub-category-change-status',{params : data})
        .subscribe(data => {
          if(data['status'] == 'success'){
            this.reloadTable();
          }
        })
      }
    })
  }

  loadMainCategoryList(){
      this.mainCategory$ = this.http.get<any[]>(this.serverUrl + "finance/item/maincategorylist").pipe(map(res => res));
  }

  saveSubCategory(){
      this.appValidator.validate();
    this.http.post(this.serverUrl + "finance/item/sub-category-save", this.formGroup.getRawValue())
    .subscribe(data => {
        if(data['status'] == 'success'){
          AppAlert.showSuccess({text: data['message']});
          this.formGroup.reset();
          this.reloadTable();
          this.model_sub_category.hide();
          //$("#model_sub_category").hide();

        }
    });

  }

  reloadTable() {//reload datatable
    this.datatable.ajax.reload(null, false);
}

  formValidate(){
    this.appValidator.validate();
  }

}
