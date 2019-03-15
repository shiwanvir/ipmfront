import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { AppValidator } from '../../core/validation/app-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

//models
import { MainCategory } from '../models/MainCategory.model';
import { SubCategory } from '../models/SubCategory.model';


@Component({
  selector: 'app-material-size',
  templateUrl: './material-size.component.html',
  styleUrls: ['./material-size.component.css']
})
export class MaterialSizeComponent implements OnInit {

  @ViewChild(ModalDirective) matSizeModel: ModalDirective;

  formGroup : FormGroup
  modelTitle : string = "New Material Size"
  readonly apiUrl = AppConfig.apiUrl()
  serverURL = AppConfig.apiServerUrl()
  formValidator : AppFormValidator = null
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'

  // processing : boolean = false
  // loading : boolean = false
  // loadingCount : number = 0
  // initialized : boolean = false

  mainCat$: Observable<MainCategory[]>;//use to load main category list in ng-select
  mainCatLoading = false;
  mainCatInput$ = new Subject<string>();
  selectedMainCat: MainCategory[];

  subCat$: Observable<SubCategory[]>;//use to load main category list in ng-select
  subCatLoading = false;
  subCatInput$ = new Subject<string>();
  selectedSubCat: SubCategory[];

  //to manage form error messages
  formFields = {
    category_name : '',
    subcategory_name : '',
    size_name : '',
    validation_error:''
  }

  constructor(private fb:FormBuilder , private http:HttpClient) { }

  ngOnInit() {
    // let primaryValidator = new PrimaryValidators(this.http)
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'merchandising/matsize/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'validation_error',
      /*error : 'Dep code already exists',*/
      data : {
        size_id : function(controls){ return controls['size_id']['value']},
        category_name : function(controls){
          if(controls['category_name']['value'] != null)
          {
            return controls['category_name']['value']['category_id']
          }else{

            return null;
          }
        },
        subcategory_name : function(controls){
          if(controls['subcategory_name']['value'] != null)
          {
            return controls['subcategory_name']['value']['subcategory_id']
          }else{

            return null;
          }
        }
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      size_id : 0,
      category_name :  [null , [Validators.required],[basicValidator.remote(remoteValidationConfig)]],
      subcategory_name :  [null , [Validators.required],[basicValidator.remote(remoteValidationConfig)]],
      size_name :  [null , [Validators.required],[basicValidator.remote(remoteValidationConfig)] ]
    })

    this.formValidator = new AppFormValidator(this.formGroup , {});//create new validation object

    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    this.createTable() //load data list
    this.loadCategory()//Load Main Category List
    this.loadSubCategory()//Load Sub Category list
  }


  createTable() { //initialize datatable
     this.datatable = $('#mat_size_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       ajax: {
            dataType : 'JSON',
            "url": this.apiUrl + "merchandising/matsize?type=datatable"
        },
        columns: [
            {
              data: "size_id",
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
          { data: "category_name" },
          { data: "subcategory_name" },
          { data: "size_name" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#mat_size_tbl').on('click','i',e => {
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
  saveMatSize(){
    //this.appValidation.validate();
    let saveOrUpdate$ = null;
    let matSizeId = this.formGroup.get('size_id').value
    let formData = this.formGroup.getRawValue();

     // debugger
    formData['category_id'] = formData['category_name']['category_id']

    formData['subcategory_id'] = formData['subcategory_name']['subcategory_id']

    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/matsize', formData)
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'merchandising/matsize/' + matSizeId , formData)
    }

    saveOrUpdate$.subscribe(
      (res) => {
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.matSizeModel.hide()
     },
     (error) => {
         console.log(error)
     }
   );
  }

  //load Customer list
    loadCategory() {
         this.mainCat$ = this.mainCatInput$
         .pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.mainCatLoading = true),
            switchMap(term => this.http.get<MainCategory[]>(this.serverURL + 'finance/item/maincategorylist' , {params:{search:term}})
            .pipe(
                //catchError(() => of([])), // empty list on error
                tap(() => this.mainCatLoading = false)
            ))
         );
     }

     loadSubCategory() {
          this.subCat$ = this.subCatInput$
          .pipe(
             debounceTime(200),
             distinctUntilChanged(),
             tap(() => this.subCatLoading = true),
             switchMap(term => this.http.get<SubCategory[]>(this.apiUrl + 'merchandising/matsize/subcat?category_id='+this.formGroup.get('category_name').value.category_id, {params:{search:term}})
             .pipe(
                 //catchError(() => of([])), // empty list on error
                 tap(() => this.subCatLoading = false)
             ))
          );
      }

     // loadSubCategory(mainCode){
     //   this.subCat$ = this.http.get<any[]>(this.serverURL + 'finance/item/get-subcatby-maincat', {params:{'category_id':mainCode}}).pipe(map(subres => subres));
     //   //console.log(this.subCategory$);
     // }


  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'merchandising/matsize/' + id )
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      if(data['status'] == '1' && data['po_status'] == '0')
      {
        this.matSizeModel.show()
        this.modelTitle = "Update Material Size"
        this.formGroup.setValue({
         'size_id' : data['size_id'],
         'category_name' : data['category'],
         'subcategory_name' : data['sub_category'],
         'size_name' : data['size_name']
        })
        // this.formGroup.get('uom_code').disable()
        this.saveStatus = 'UPDATE'
      }else if(data['po_status']=='1'){
          AppAlert.showError({text : "PO Already Exists" })
          this.reloadTable()
       }
    })
  }


  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected Material Size?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'merchandising/matsize/' + id)
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
    // this.formGroup.get('uom_code').enable()
    this.formGroup.reset();
    this.modelTitle = "New Material Size"
    this.saveStatus = 'SAVE'
  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }



}
