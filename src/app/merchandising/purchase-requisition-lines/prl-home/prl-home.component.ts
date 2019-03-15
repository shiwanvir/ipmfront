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
import { Po_type } from '../../../merchandising/models/po_type.model';
import { Supplier } from '../../../org/models/supplier.model';

import { Deliverto } from '../../../merchandising/models/deliverto.model';
import { Invoiceto } from '../../../merchandising/models/invoiceto.model';
import { Ship_mode } from '../../../merchandising/models/ship_mode.model';



@Component({
  selector: 'app-prl-home',
  templateUrl: './prl-home.component.html',
  styleUrls: ['./prl-home.component.css']
})
export class PrlHomeComponent implements OnInit {

  @ViewChild(ModalDirective) detailsModel: ModalDirective;
  instance2: string = 'instance2';
  readonly apiUrl = AppConfig.apiUrl()


  formHeader : FormGroup
  formValidatorHeader : AppFormValidator
  saveStatus = 'SAVE'
  initializedHeader : boolean = false
  loadingHeader : boolean = false
  loadingCountHeader : number = 0
  processingHeader : boolean = false
  currentDataSetIndex : number = -1
  currencyId = null;
  poid = ''
  modelTableTitle = ''
  currencyDivisions : Array<Customer>

  dataset2: any[] = [];
  hotOptions2: any

  po_type$: Observable<Po_type[]>;//use to load style list in ng-select
  po_typeLoading = false;
  po_typeInput$ = new Subject<string>();
  selectedPo_type : any[];


  supplier$: Observable<Supplier[]>;//use to load style list in ng-select
  supplierLoading = false;
  supplierInput$ = new Subject<string>();
  selectedSupplier : any[];

  deliverto$: Observable<Deliverto[]>;//use to load style list in ng-select
  delivertoLoading = false;
  delivertoInput$ = new Subject<string>();
  selectedDeliverto : any[];

  invoiceto$: Observable<Invoiceto[]>;//use to load style list in ng-select
  invoicetoLoading = false;
  invoicetoInput$ = new Subject<string>();
  selectedInvoiceto : any[];

  ship_mode$: Observable<Ship_mode[]>;//use to load style list in ng-select
  ship_modeLoading = false;
  ship_modeInput$ = new Subject<string>();
  selectedShip_mode : any[];

  tosterConfig = { timeout: 2000, showProgressBar: false, closeOnClick: false , position: SnotifyPosition.rightTop,}

  constructor(private fb:FormBuilder , private http:HttpClient , private hotRegisterer: HotTableRegisterer ,
   private snotifyService: SnotifyService, private prlService : PrlService) { }

  ngOnInit() {

    this.initializePRLTable()
    this.loadHeaderFormData()
    this.initializeHeaderForm()


    this.prlService.lineData.subscribe(data => {
      //alert(data)
      if(data != null){
        this.formHeader.patchValue({prl_id: data });
        //this.saveStatus = 'UPDATE'
        //this.orderId = data
        //this.viewHeader(this.orderId)
        //this.loadOrderDetails(this.orderId)
        //var element = <HTMLInputElement> document.getElementById("po_type");
        //element.disabled = true;
        //const hotInstance = this.hotRegisterer.getInstance(this.instance);
        //hotInstance.render()
      }
    })
  }

  initializePRLTable(){
    this.hotOptions2 = {
      columns: [
        { type: 'checkbox', title : 'Action' , readOnly: false , checkedTemplate: 'yes',  uncheckedTemplate: 'no' },
        //{ type: 'text', title : 'Type' , data: 'type_created'},
        { type: 'text', title : 'Meterial' , data: 'category_name' , readOnly: true},
        { type: 'text', title : 'Item  Description' , data: 'master_description' , readOnly: true },
        { type: 'text', title : 'Unit' , data: 'uom_description' },
        { type: 'text', title : 'Unit Price' , data: 'unit_price' },
        { type: 'text', title : 'Color' , data: 'color_name' },
        { type: 'text', title : 'Size' , data: 'size_name' },
        { type: 'text', title : 'Qty' , data: 'bal_order' },
        { type: 'text', title : 'Transfer Qty' ,readOnly: false, data: 'tra_qty' },
        { type: 'text', title : 'Value' , data: 'value_sum' }

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
      afterChange:(changes,surce,row,col,value,prop)=>{

      let x=this.dataset2;
      if(surce!=null){
      let y=surce["0"]["0"];
      //console.log(changes);
      //console.log(y);
      //console.log(surce);
      //console.log(surce["0"]["3"]);
      //console.log(this.dataset2[y]["total_qty"]);
      this.dataset2[y]['value_sum'] = this.dataset2[y]['unit_price'] * this.dataset2[y]['tra_qty'];
      const hotInstance = this.hotRegisterer.getInstance(this.instance2);
      hotInstance.render()

      if(this.dataset2[y]["total_qty"]<surce["0"]["3"]){
        AppAlert.showError({text:"Stock Qty Exceeded"});
        this.dataset2[y]['tra_qty'] = null;
        this.dataset2[y]['value_sum'] = null;
        const hotInstance = this.hotRegisterer.getInstance(this.instance2);
        hotInstance.render()

          }

        }

      },
      contextMenu : {
          callback: function (key, selection, clickEvent) {
            // Common callback for all options
          },
          items : {
            'split' : {
              name : 'Delivery Split',
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  //this.contextMenuMerge()
                }
              }
            },

          }
      }
    }
  }

  initializeHeaderForm(){
    this.formHeader = this.fb.group({
      po_id: 0,
      prl_id : 0,
      po_type : [null , [Validators.required]],
      po_date : [null , [Validators.required]],
      supplier : [null , [Validators.required]],
      currency : [null , [Validators.required]],
      delivery_date : [null , [Validators.required]],
      deliverto : [null , [Validators.required]],
      invoiceto : [null , [Validators.required]],
      special_ins : null,
      pay_mode : [null , [Validators.required]],
      pay_term : [null , [Validators.required]],
      ship_mode : [null , [Validators.required]],
      ship_term : [null , [Validators.required]],
      po_number : null,
      po_status : null
    })
    this.formValidatorHeader = new AppFormValidator(this.formHeader , {})
  }


  loadHeaderFormData()
  {

    this.Loadpotype()
    this.loadSuppliers()
    this.loadLocation()
    this.loadCompany()
    this.loadShipMode()


  }

  Loadpotype() {
       this.po_type$ = this.po_typeInput$
       .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          tap(() => this.po_typeLoading = true),
          switchMap(term => this.http.get<Po_type[]>(this.apiUrl + 'org/PoType?type=auto' , {params:{search:term}})
          .pipe(
              //catchError(() => of([])), // empty list on error
              tap(() => this.po_typeLoading = false)
          ))
       );
   }


   loadSuppliers() {
        this.supplier$ = this.supplierInput$
        .pipe(
           debounceTime(200),
           distinctUntilChanged(),
           tap(() => this.supplierLoading = true),
           switchMap(term => this.http.get<Supplier[]>(this.apiUrl + 'org/suppliers?type=currency' , {params:{search:term}})
           .pipe(
               //catchError(() => of([])), // empty list on error
               tap(() => this.supplierLoading = false)
           ))
        );
    }

    load_currency(data) {
      if(data == undefined){
        this.currencyId = null;
      }
      else{
        //console.log(data)
        this.currencyId = data.currency;
        //this.styleDescription = data.style_description
      //  this.http.get(this.apiUrl + 'org/suppliers/load_currency?id='+this.currencyId)
        this.http.post(this.apiUrl + 'org/suppliers/load_currency' , { 'curid' : this.currencyId } )
        .pipe( map(res => res['data'] ))
        .subscribe(
          data => {
            //console.log(data.currency)
            //this.customerDetails = data.customer_code + ' / ' + data.customer_name
            this.currencyDivisions = data.currency

          },
          error => {
            console.log(error)
          }
        )
        //this.customerDetails = ''
      }
      //console.log(data)
    }


    loadCompany() {
         this.deliverto$ = this.delivertoInput$
         .pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.delivertoLoading = true),
            switchMap(term => this.http.get<Deliverto[]>(this.apiUrl + 'org/companies?type=auto' , {params:{search:term}})
            .pipe(
                //catchError(() => of([])), // empty list on error
                tap(() => this.delivertoLoading = false)
            ))
         );
     }

    loadLocation() {
         this.invoiceto$ = this.invoicetoInput$
         .pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.invoicetoLoading = true),
            switchMap(term => this.http.get<Invoiceto[]>(this.apiUrl + 'org/locations?type=auto' , {params:{search:term}})
            .pipe(
                //catchError(() => of([])), // empty list on error
                tap(() => this.invoicetoLoading = false)
            ))
         );
     }


     loadShipMode() {
          this.ship_mode$ = this.ship_modeInput$
          .pipe(
             debounceTime(200),
             distinctUntilChanged(),
             tap(() => this.ship_modeLoading = true),
             switchMap(term => this.http.get<Ship_mode[]>(this.apiUrl + 'org/ship-modes?type=auto' , {params:{search:term}})
             .pipe(
                 //catchError(() => of([])), // empty list on error
                 tap(() => this.ship_modeLoading = false)
             ))
          );
      }

      //save customer order header details
      saveHeader() {

        if(!this.formValidatorHeader.validate())//if validation faild return from the function
          return;
        this.processingHeader = true
        AppAlert.showMessage('Processing...','Please wait while saving details')

        let saveOrUpdate$ = null;
        let ordId = this.formHeader.get('po_id').value
        let formData = this.formHeader.getRawValue();
        formData['po_type'] = formData['po_type']['po_type']
        formData['po_sup_code'] = formData['supplier']['supplier_id']
        formData['po_deli_loc'] = formData['deliverto']['company_id']
        formData['po_def_cur'] = formData['currency']
        formData['delivery_date'] = formData['delivery_date'].toISOString().split("T")[0]
        formData['po_date'] = formData['po_date'].toISOString().split("T")[0]
        formData['ship_mode'] = formData['ship_mode']['ship_mode']
        formData['invoice_to'] = formData['invoiceto']['loc_id']

        if(this.saveStatus == 'SAVE') {
          //console.log(formData)
          saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/po-manual', formData)
          //this.dataset = [] //clear order details table
        }
        else if(this.saveStatus == 'UPDATE') {
          saveOrUpdate$ = this.http.put(this.apiUrl + 'merchandising/po-manual/' + ordId , formData)
        }

        saveOrUpdate$
        .pipe( map(res => res['data'] ) )
        .subscribe(
          (res) => {
            //console.log(res)
            this.formHeader.patchValue({po_number: res.savepo['po_number'] });
            this.formHeader.patchValue({po_status: res.savepo['po_status'] });
            this.formHeader.patchValue({po_id: res.savepo['po_id'] });
            this.saveStatus = 'UPDATE'
            this.loadTable()
            this.processingHeader = false
            setTimeout(() => {
              AppAlert.closeAlert()
              AppAlert.showSuccess({text : res.message })
            } , 1000)
         },
         (error) => {
           this.processingHeader = false
           setTimeout(() => {
             AppAlert.closeAlert()
             AppAlert.showError({text : 'Process Error' })
           } , 1000)
             console.log(error)
         }
       );
      }


      loadTable(){

        let formData = this.formHeader.getRawValue();

        AppAlert.showMessage('Processing...','Please wait while saving details')
        this.http.post(this.apiUrl + 'merchandising/po-manual-details/load_reqline' , formData)
        .subscribe(data => {

           let count_ar =  data['data']['count']
           //console.log(data)
           for (var _i = 0; _i < count_ar; _i++)
          {
             this.dataset2.push(data['data']['load_list'][_i])
             const hotInstance = this.hotRegisterer.getInstance(this.instance2);
             hotInstance.render()
           }


         setTimeout(() => { AppAlert.closeAlert() } , 1000)
          },
         error => {
           //this.snotifyService.error('Inserting Error', this.tosterConfig)
           setTimeout(() => { AppAlert.closeAlert() } , 1000)
         })


      }

      savedetails(){

        let savedetais$
        let arr=[]
        var x=this.dataset2.length;var i;
        let formData = this.formHeader.getRawValue();
        formData['delivery_date'] = formData['delivery_date'].toISOString().split("T")[0]
        //console.log(this.dataset2)
        //console.log(formData)
        //console.log(formData)


    for(i=0;i<x;i++){
      if(this.dataset2[i]['tra_qty']!=0){

        savedetais$=this.http.post(this.apiUrl + 'merchandising/po-manual-details/save_line_details' , { 'lines' : this.dataset2 ,'formData':formData });
        savedetais$.subscribe(
          (res) =>{

            AppAlert.showSuccess({text:res.data.message})

          },
            (error)=>{
              console.log(error)
            }

        );
        return;
      }


    }
    AppAlert.showError({text:"please Enter Transfer Qty"})




    }





}
