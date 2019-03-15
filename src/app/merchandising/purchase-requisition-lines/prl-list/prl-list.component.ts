import { Component, OnInit , ViewChild} from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';
//declare var $:any;

import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';
//import { AppValidator } from '../../core/validation/app-validator';
import { AppFormValidator } from '../../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../../core/validation/primary-validators';
import { PrlService } from '../prl.service';

import { Customer } from '../../../org/models/customer.model';
import { Item } from '../../../org/models/item.model';
import { Supplier } from '../../../org/models/supplier.model';
import { Cuspo } from '../../../org/models/customerpo.model';
import { Division } from '../../../org/models/division.model';
import { Style } from '../../models/style.model';


@Component({
  selector: 'app-prl-list',
  templateUrl: './prl-list.component.html',
  styleUrls: ['./prl-list.component.css']
})
export class PrlListComponent implements OnInit {

  @ViewChild(ModalDirective) detailsModel: ModalDirective;
  instance: string = 'instance';
  readonly apiUrl = AppConfig.apiUrl()
  customerId = null;
  customerDivisions : Array<Customer>
  modelTableTitle = ''
  formHeader : FormGroup
  formValidatorHeader : AppFormValidator
  saveStatus = 'SAVE'
  initializedHeader : boolean = false
  loadingHeader : boolean = false
  loadingCountHeader : number = 0
  processingHeader : boolean = false
  currentDataSetIndex : number = -1

  dataset: any[] = [];
  hotOptions: any;

  customer$: Observable<Customer[]>;//use to load style list in ng-select
  customerLoading = false;
  customerInput$ = new Subject<string>();
  selectedCustomer : any[];

  division$: Observable<Division[]>;//use to load style list in ng-select
  divisionLoading = false;
  divisionInput$ = new Subject<string>();
  selectedDivision : any[];

  style$: Observable<Style[]>;//use to load style list in ng-select
  styleLoading = false;
  styleInput$ = new Subject<string>();
  selectedStyle : any[];

  item$: Observable<Item[]>;//use to load style list in ng-select
  itemLoading = false;
  itemInput$ = new Subject<string>();
  selectedItem : any[];

  supplier$: Observable<Supplier[]>;//use to load style list in ng-select
  supplierLoading = false;
  supplierInput$ = new Subject<string>();
  selectedSupplier : any[];

  cuspo$: Observable<Cuspo[]>;//use to load style list in ng-select
  cuspoLoading = false;
  cuspoInput$ = new Subject<string>();
  selectedCuspo : any[];

  tosterConfig = { timeout: 2000, showProgressBar: false, closeOnClick: false , position: SnotifyPosition.rightTop,}


  constructor(private fb:FormBuilder , private http:HttpClient , private hotRegisterer: HotTableRegisterer ,
   private snotifyService: SnotifyService, private prlService : PrlService) { }

  ngOnInit() {
    this.initializePRLTable()
    this.loadHeaderFormData()
    this.initializeHeaderForm() //create


  }

  initializeHeaderForm(){
    this.formHeader = this.fb.group({

      customer : [null , [Validators.required]],
      order_division : null,
      style : null,
      item : null,
      supplier : null,
      cuspo : null,
      pcd_date : null
    })
    this.formValidatorHeader = new AppFormValidator(this.formHeader , {})
  }

  //initialize handsontable for customer order line table
  initializePRLTable(){
    this.hotOptions = {
      columns: [
        { type: 'checkbox', title : 'Action' , readOnly: false , checkedTemplate: 'yes',  uncheckedTemplate: 'no' },
        //{ type: 'text', title : 'Type' , data: 'type_created'},
        { type: 'text', title : 'BOM ID' , data: 'bom_id' , readOnly: true},
        { type: 'text', title : 'Customer PO' , data: 'po_no' , readOnly: true },
        { type: 'text', title : 'Item Code' , data: 'master_id' },
        { type: 'text', title : 'Description' , data: 'master_description' },
        { type: 'text', title : 'Color' , data: 'color_name' },
        { type: 'text', title : 'Size' , data: 'size_name' },
        { type: 'text', title : 'UOM' , data: 'uom_code' },
        { type: 'text', title : 'Supplier' , data: 'supplier_name' },
        { type: 'text', title : 'Unit Price' , data: 'unit_price' },
        { type: 'text', title : 'Required Qty' , data: 'total_qty' },
        { type: 'text', title : 'Qty with MOQ' , data: 'bom_id' },
        { type: 'text', title : 'Qty with MCQ' , data: 'bom_id' },
        { type: 'text', title : 'PO Qty' , data: 'req_qty' },
        { type: 'text', title : 'Balance to Order' , data: 'bal_oder' },
        //{ type: 'text', title : 'Status' , data: 'bom_id' },
        { type: 'text', title : 'PCD' , data: 'pcd' },
        { type: 'text', title : 'Factory' , data: 'loc_name' },
        { type: 'text', title : 'PO Numbers' , data: 'po_nos' }

      ],
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 250,
      stretchH: 'all',
      selectionMode: 'range',
      fixedColumnsLeft: 3,
      /*columnSorting: true,*/
      className: 'htCenter htMiddle',
      readOnly: true,
      cells : function(surce,row, col, prop , value){ //table cell render event. works for every cell in the table
        var cellProperties = {};
        // var data = this.dataset;//this.instance.getData();
        // if(col == 1){
        //  cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
        //    var args = arguments;
        //      if(prop == 'type_created' && value == 'GFM'){
        //        td.style.background = '#ffcccc';
        //      }
        //      else if(prop == 'type_created' && value == 'GFS'){
        //          td.style.background = '#b3ff66';
        //      }
        //      Handsontable.renderers.TextRenderer.apply(this, args);
        //    }
        //    }

        return cellProperties;
      },
      contextMenu : {
          callback: function (key, selection, clickEvent) {
            // Common callback for all options
          },
          items : {
            'merge' : {
              name : 'Merge Deliveries',
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  this.contextMenuMerge()
                }
              }
            },

          }
      }
    }
  }

  //context menu - merge
  contextMenuMerge(){
    let arr = [];
    let str = '';
    for(let x = 0 ; x < this.dataset.length ; x++)
    {
      if(this.dataset[x]['0'] != undefined && this.dataset[x]['0'] == 'yes'){
        arr.push(this.dataset[x])
        str += this.dataset[x]['bom_id'] + ',';
      }
    }
    //console.log(arr)
    if(arr.length == 0)
    {
    AppAlert.showError({ text : 'Please Select Line/Lines, What you want to Merge !' })
    }
    if(arr.length >= 1)
    {
      AppAlert.showConfirm({
        'text' : 'Do you want to merge (' + str + ') BOMs?'
            },(result) => {
        if (result.value) {
          this.mergerLines(arr)
        }
      })
    }
  }


  mergerLines(lines){
    AppAlert.showMessage('Processing...','Please wait while merging details')
    this.http.post(this.apiUrl + 'merchandising/po-manual-details/merge_save' , { 'lines' : lines } )
    .pipe( map( res => res['data']) )
    .subscribe(
      data => {
        if(data.status == 'success'){
            setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showSuccess({ text : data.message });
          } , 1000)
          this.loadOrderLines(data.merge_no)
        }
        else{
          //this.snotifyService.error(data.message, this.tosterConfig);
            setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showError({ text : data.message });
          } , 1000)
        }
      },
       error => {
        //this.snotifyService.error('Process Error', this.tosterConfig);
           setTimeout(() => {
           AppAlert.closeAlert()
           AppAlert.showError({ text : 'Process Error' });
         } , 1000)
        console.log(error)
      }
    )
  }

  loadOrderLines(data){
    this.prlService.changeData(data)
    //alert(data)
  }

  loadHeaderFormData(){
    this.loadingHeader = true
    this.loadingCountHeader = 0
    if(!this.initializedHeader){
      this.loadCustomer()
      this.initializedHeader = true;
    }
    this.loadStyles()
    this.loadItemDes()
    this.loadSuppliers()
    this.loadCustomerPo()

    //this.loadCustomerOrderTypes()
    //this.loadOrderStatus()
  }

  searchFrom(){

    let formData = this.formHeader.getRawValue();
    //console.log(formData)

    AppAlert.showMessage('Processing...','Please wait while saving details')
    this.http.post(this.apiUrl + 'merchandising/po-manual-details/load_bom_Details' , formData)
    //this.http.get(this.apiUrl + 'merchandising/purchase-req-list' , formData)
    .subscribe(data => {

      console.log(data)
      //this.dataset[this.currentDataSetIndex] = data.customer_list
      let count_ar = data['data']['count'];
      for (var _i = 0; _i < count_ar; _i++)
      {
        data['data']['load_list'][_i]['bal_oder'] = data['data']['load_list'][_i]['total_qty'] - data['data']['load_list'][_i]['req_qty']
        this.dataset.push(data['data']['load_list'][_i])
        const hotInstance = this.hotRegisterer.getInstance(this.instance);
        hotInstance.render()
      }


    setTimeout(() => { AppAlert.closeAlert() } , 1000)
     },
    error => {
      //this.snotifyService.error('Inserting Error', this.tosterConfig)
      setTimeout(() => { AppAlert.closeAlert() } , 1000)
    })


  }


  loadCustomer() {
       this.customer$ = this.customerInput$
       .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          tap(() => this.customerLoading = true),
          switchMap(term => this.http.get<Customer[]>(this.apiUrl + 'org/customers?type=auto' , {params:{search:term}})
          .pipe(
              //catchError(() => of([])), // empty list on error
              tap(() => this.customerLoading = false)
          ))
       );
   }

   load_divition(data) {
     if(data == undefined){
       this.customerId = null;
     }
     else{
       this.customerId = data.customer_id;
       //this.styleDescription = data.style_description
       this.http.get(this.apiUrl + 'org/customers/'+this.customerId)
       .pipe( map(res => res['data'] ))
       .subscribe(
         data => {
           //console.log(data.divisions)
           //this.customerDetails = data.customer_code + ' / ' + data.customer_name
           this.customerDivisions = data.divisions
         },
         error => {
           console.log(error)
         }
       )
       //this.customerDetails = ''
     }
     //console.log(data)
   }

   loadStyles() {
        this.style$ = this.styleInput$
        .pipe(
           debounceTime(200),
           distinctUntilChanged(),
           tap(() => this.styleLoading = true),
           switchMap(term => this.http.get<Style[]>(this.apiUrl + 'merchandising/customer-orders?type=style' , {params:{search:term}})
           .pipe(
               //catchError(() => of([])), // empty list on error
               tap(() => this.styleLoading = false)
           ))
        );
    }


    loadItemDes() {
         this.item$ = this.itemInput$
         .pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.itemLoading = true),
            switchMap(term => this.http.get<Item[]>(this.apiUrl + 'items/itemlists?type=auto' , {params:{search:term}})
            .pipe(
                //catchError(() => of([])), // empty list on error
                tap(() => this.itemLoading = false)
            ))
         );
     }


     loadSuppliers() {
          this.supplier$ = this.supplierInput$
          .pipe(
             debounceTime(200),
             distinctUntilChanged(),
             tap(() => this.supplierLoading = true),
             switchMap(term => this.http.get<Supplier[]>(this.apiUrl + 'org/suppliers?type=auto' , {params:{search:term}})
             .pipe(
                 //catchError(() => of([])), // empty list on error
                 tap(() => this.supplierLoading = false)
             ))
          );
      }


      loadCustomerPo() {
           this.cuspo$ = this.cuspoInput$
           .pipe(
              debounceTime(200),
              distinctUntilChanged(),
              tap(() => this.cuspoLoading = true),
              switchMap(term => this.http.get<Cuspo[]>(this.apiUrl + 'merchandising/customer-order-details?type=auto' , {params:{search:term}})
              .pipe(
                  //catchError(() => of([])), // empty list on error
                  tap(() => this.cuspoLoading = false)
              ))
           );
       }






}
