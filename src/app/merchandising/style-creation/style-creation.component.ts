// import { Component, OnInit } from '@angular/core';
import { Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators,FormControl,FormArray,ValidatorFn} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';


import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
import Swal from 'sweetalert2'

//models
import { customer } from '../models/customer.model';
import { ProductCategory } from '../models/ProductCategory.model';
import { ProductType } from '../models/ProductType.model';
import { ProductFeature } from '../models/ProductFeature.model';
import { ProductSilhouette } from '../models/ProductSilhouette.model';
import { Division } from '../models/Division.model';


declare var $:any;
import { ModalDirective } from 'ngx-bootstrap/modal';

import { KeysPipe } from '../pips/keys.pipe';

@Component({
  selector: 'app-style-creation',
  templateUrl: './style-creation.component.html',
  styleUrls: ['./style-creation.component.css']
})

export class StyleCreationComponent implements OnInit {
  @ViewChild(ModalDirective) sectionModel: ModalDirective;

  modelTitle : string = "New Action"
  saveStatus = 'SAVE'

  datatable:any = null;
  formGroup : FormGroup
  customer$:Observable<Array<any>>//observable to featch source list
  customerLoading = false;
  customerInput$ = new Subject<string>();
  selectedCustomer:customer

  productType$:Observable<Array<any>>//observable to featch source list
  productTypeLoading = false;
  productTypeInput$ = new Subject<string>();
  selectedproductType:ProductType

  ProductCategory$:Observable<Array<any>>//observable to featch source list
  ProductCategoryLoading = false;
  ProductCategoryInput$ = new Subject<string>();
  selectedProductCategory:ProductCategory

  ProductFeature$:Observable<Array<any>>//observable to featch source list
  ProductFeatureLoading = false;
  ProductFeatureInput$ = new Subject<string>();
  selectedProductFeature:ProductFeature[] = <any>[]
  // selectedProductFeature:ProductFeature


  ProductSilhouette$:Observable<Array<any>>//observable to featch source list
  ProductSilhouetteLoading = false;
  ProductSilhouetteInput$ = new Subject<string>();
  selectedProductSilhouette:ProductSilhouette

  Division$:Observable<Array<any>>//observable to featch source list
  DivisionLoading = false;
  DivisionInput$ = new Subject<string>();
  selectedDivision:Division


  public imgSrc = 'http://surface/assets/styleImage/dif.png';
  serverUrl = AppConfig.apiServerUrl();
  apiUrl = AppConfig.apiUrl();
  constructor(private fb:FormBuilder , private http:HttpClient) {

    this.formGroup = this.fb.group({
      customer : [null , [Validators.required]],
      ProductCategory :[null , [Validators.required]],
      ProductType : [null , [Validators.required]],
      ProductFeature : [null , [Validators.required]],
      ProductSilhouette : [null , [Validators.required]],
      style_no : [null , [Validators.required]],
      style_description: [null , [Validators.required]],
      division: [null , [Validators.required]],
      Remarks: [null , [Validators.required]],
      // items: new FormArray(controls, minSelectedCheckboxes(1)),
      avatar: null,
      style_id:null,
      avatarHidden:[]
    })

  }



  ngOnInit() {

    this.getClusterList();
    this.getProductCategory();
    this.getProductType();
    this.getProductFeature();
    this.getProductSilhouette();
    this.createTable();
    this.getDivision();

  }

  createTable() { //initialize datatable
    this.datatable = $('#season_tbl').DataTable({
      autoWidth: false,
      scrollY: "500px",
      scrollCollapse: true,
      processing: true,
      serverSide: true,
      ajax: {
        dataType : 'JSON',
        "url": this.apiUrl + "merchandising/get-style?type=datatable"
      },
      columns: [
        {
          data: "style_id",
          orderable: false,
          width: '3%',
          render : function(data,arg,full){
            var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
            str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
            return str;
          }
        }, {
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
        { data: "style_no" },
        { data: "style_description" },
        { data: "remark" }
      ],

    });

    //listen to the click event of edit and delete buttons
    $('#season_tbl').on('click','i',e => {
      let att = e.target.attributes;
      if(att['data-action']['value'] === 'EDIT'){
        this.edit(att['data-id']['value']);
      }
      else if(att['data-action']['value'] === 'DELETE'){
        this.delete(att['data-id']['value']);
      }
    })
  }

  getClusterList() {
    this.customer$ = concat(
        of([]), // default items
        this.customerInput$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.customerLoading = true),
            switchMap(term => this.http.get<customer[]>(this.serverUrl + 'api/getCustomer',{params:{search:term}}).pipe(
                catchError(() => of([])), // empty list on error
                tap(() => this.customerLoading = false)
            ))
        )
    );
  }

  getProductCategory() {
    this.ProductCategory$ = concat(
        of([]), // default items
        this.ProductCategoryInput$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.ProductCategoryLoading = true),
            switchMap(term => this.http.get<customer[]>(this.serverUrl + 'api/getProductCategory',{params:{search:term}}).pipe(
                catchError(() => of([])), // empty list on error
                tap(() => this.ProductCategoryLoading = false)
            ))
        )
    );
  }

  getDivision() {
    this.Division$ = concat(
        of([]), // default items
        this.DivisionInput$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.DivisionLoading = true),
            switchMap(term => this.http.get<customer[]>(this.serverUrl + 'api/getDivision?type=auto&customer_id='+this.formGroup.get('customer').value.customer_id,{params:{search:term}}).pipe(
                catchError(() => of([])), // empty list on error
                tap(() => this.DivisionLoading = false)
            ))
        )
    );
  }


  getProductType() {
    this.productType$ = concat(
        of([]), // default items
        this.productTypeInput$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.productTypeLoading = true),
            switchMap(term => this.http.get<ProductType[]>(this.serverUrl + 'api/getProductType',{params:{search:term}}).pipe(
                catchError(() => of([])), // empty list on error
                tap(() => this.productTypeLoading = false)
            ))
        )
    );
  }

  getProductFeature() {
    this.ProductFeature$ = concat(
        of([]), // default items
        this.ProductFeatureInput$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.ProductFeatureLoading = true),
            switchMap(term => this.http.get<ProductType[]>(this.serverUrl + 'api/getProductFeature',{params:{search:term}}).pipe(
                // map(res => res['items']),
                catchError(() => of([])), // empty list on error
                tap(() => this.ProductFeatureLoading = false)
            ))
        )
    );

  }


  getProductSilhouette() {
    this.ProductSilhouette$ = concat(
        of([]), // default items
        this.ProductSilhouetteInput$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.ProductSilhouetteLoading = true),
            switchMap(term => this.http.get<ProductType[]>(this.serverUrl + 'api/getProductSilhouette',{params:{search:term}}).pipe(
                catchError(() => of([])), // empty list on error
                tap(() => this.ProductSilhouetteLoading = false)
            ))
        )
    );
  }

  saveStyle(){
    this.http.post(this.serverUrl + 'api/style-creation.save',this.formGroup.getRawValue())
        .subscribe(data => {
          if(data['status'] == 'success'){
            Swal({
              type : 'success',
              title : 'Success',
              text : data['message'],
              confirmButtonColor: "#66BB6A"
            });

            this.formGroup.reset();
            this.imgSrc = AppConfig.StayleImage()+data['image'];
            this.sectionModel.hide();
          }
          this.reloadTable();

        });
    console.log(this.formGroup.getRawValue())
  }


  onFileChange(event) {
    console.log(event.target.files,'aaa');
    let reader = new FileReader();
    if(event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      this.formGroup.get('avatarHidden').setValue({
        value: file.name
      })
      reader.readAsDataURL(file);
      reader.onload = () => {

        this.formGroup.get('avatar').setValue({
          filename: file.name,
          filetype: file.type,
          value: reader.result.split(',')[1]
        })
      };
    }
  }

  edit(id) {
    this.http.get(this.apiUrl + "merchandising/style/" + id)
        .pipe(map( data => data['data'] ))
        .subscribe(data => {
          if(data['status'] == '1')
          {
             console.log(data)
            this.sectionModel.show()
            this.modelTitle = "Update Action"
            this.formGroup.setValue({
              customer : data['customer'],
              ProductCategory : data['ProductCategory'],
              ProductType : data['productType'],
              ProductFeature : data['product_feature'],
              ProductSilhouette : data['ProductSilhouette'],
              style_no : data['style_no'],
              style_description: data['style_description'],
              division: data['division'][0],
              Remarks: data['remark'],
              avatar: null,
              style_id:data['style_id'],
              avatarHidden:null

            })
            this.saveStatus = 'UPDATE'
            this.imgSrc = AppConfig.StayleImage()+data['image'];


          }
          this.reloadTable()
        })
  }

  delete(id) {
    AppAlert.showConfirm({
          'text' : 'Do you want to deactivate selected Action?'
        },
        (result) => {
          if (result.value) {
            this.http.delete(this.apiUrl + "merchandising/style/" + id)
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

  reloadTable() {//reload datatable11
    this.datatable.ajax.reload(null, false);
  }

  showEvent(event){ //show event of the bs model
    this.imgSrc = AppConfig.StayleImage()+'dif.png';
    this.formGroup.reset();
    this.modelTitle = "New Action"
    this.saveStatus = "SAVE"
  }



}
function minSelectedCheckboxes(min = 1) {
  const validator: ValidatorFn = (formArray: FormArray) => {
    const totalSelected = formArray.controls
        .map(control => control.value)
        .reduce((prev, next) => next ? prev + next : prev, 0);

    return totalSelected >= min ? null : { required: true };
  };

  return validator;
}
