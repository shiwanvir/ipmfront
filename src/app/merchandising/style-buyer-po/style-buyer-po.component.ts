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

import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';
//import { AppValidator } from '../../core/validation/app-validator';
import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { BuyerPoService } from './buyer-po.service';

//models
import { Country } from '../../org/models/country.model';
import { Division } from '../../org/models/division.model';
import { Customer } from '../../org/models/customer.model';
import { Location } from '../../org/models/location.model';
import { Style } from '../models/style.model';
import { OrderType } from '../models/order-type.model';


/*interface ProductDetails {
  details_id : number,
  style_color : string,
  style_description : string,
  pcd : any,
  rm_in_date : any,
  po_no : any,
  planned_delivery_date : any,
  fob : any,
  country : any,
  projection_location : any,
  order_qty : any,
  excess_presentage : any,
  planned_qty : any,
  delivery_status : any,
  ship_mode : any
}*/



@Component({
  selector: 'app-style-buyer-po',
  templateUrl: './style-buyer-po.component.html',
  styleUrls: []
})
export class StyleBuyerPoComponent implements OnInit {

    @ViewChild(ModalDirective) detailsModel: ModalDirective;
    instance: string = 'instance';
    readonly apiUrl = AppConfig.apiUrl()


    //header variables ........................................
    orderId = 0
    orderCode = ''
    customerId = null;
    customerDetails : string = ''
    styleDescription : string = ''
    customerDivisions : Array<Customer>
    formHeader : FormGroup

    formValidatorHeader : AppFormValidator
    saveStatus = 'SAVE'
    initializedHeader : boolean = false
    loadingHeader : boolean = false
    loadingCountHeader : number = 0
    processingHeader : boolean = false

    style$: Observable<Style[]>;//use to load style list in ng-select
    styleLoading = false;
    styleInput$ = new Subject<string>();
    divisions$: Observable<Division[]>;
    orderTypes$ : Observable<OrderType[]>;
    orderStatus$ : Observable<Array<string>>

    //orer details variables ...................................
    formDetails : FormGroup
    saveStatusDetails : string = 'SAVE'
    formValidatorDetails : AppFormValidator
    initializedDetails : boolean = false
    loadingDetails : boolean = false
    loadingCountDetails : number = 0
    processingDetails : boolean = false
    modelTitle = 'Add Customer Order Line'
    currentDataSetIndex : number = -1

    shipModes$ : Observable<Array<string>>
    colors$ : Observable<Array<any>>
    locations$ : Observable<Location[]>
    country$: Observable<Country[]>;//use to load country list in ng-select
    countryLoading = false;
    countryInput$ = new Subject<string>();
    selectedCountry: Country[]

    //hot table variables ...............................................
    dataset: any[] = [];
    hotOptions: any
    //toster plugin
    tosterConfig = { timeout: 2000, showProgressBar: false, closeOnClick: false , position: SnotifyPosition.rightTop,}


  constructor(private fb:FormBuilder , private http:HttpClient , private hotRegisterer: HotTableRegisterer ,
    private buyerPoService : BuyerPoService, private snotifyService: SnotifyService) { }

  ngOnInit() {

    this.initializeHeaderForm() //create order header form group
    this.initializeDetailsForm() // create delivery form group
    this.loadHeaderFormData() //load order header data
    this.initializeOrderLinesTable() //initialize handson table for order lines

    //lisiten to the click event of orders table's edit button in StyleBuyerPoListComponent
    this.buyerPoService.poData.subscribe(data => {
      if(data != null){
        this.saveStatus = 'UPDATE'
        this.orderId = data
        //show loading alert befor loading customer order header
        AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while loading customer order')
        this.loadingHeader = true
        this.loadingCountHeader = 0
        this.loadOrderHeaderDetails(this.orderId)
        this.loadOrderLines(this.orderId)
      }
      else{//clear data if incorrect customer order selected
        this.saveStatus = 'SAVE'
        this.orderId = 0
        this.formHeader.reset()
      }
    })

    //listen to the save button's click event of PoSplitComponent
    this.buyerPoService.splitStatus.subscribe(data => {
      if(data == true){
          AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while loading customer order lines')
          this.loadOrderLines(this.orderId)
          this.buyerPoService.changeSplitStatus(false)
      }
    })

  }

  //initialize form group for customer order header
  initializeHeaderForm(){
    this.formHeader = this.fb.group({
      order_id : 0,
      order_style : [null , [Validators.required]],
      order_customer : [null , [Validators.required]],
      order_division : [null , [Validators.required]],
      order_type : [null , [Validators.required]],
      order_status : null//[null , [Validators.required]]
    })
    this.formValidatorHeader = new AppFormValidator(this.formHeader , {})
  }

  //initialize form group for customer order line
  initializeDetailsForm(){
    this.formDetails = this.fb.group({
      details_id : 0,
      style_color : [null , [Validators.required]],
      style_description : [null/*,[Validators.required]*/],
      pcd : [null , [Validators.required]],
      rm_in_date : [null , [Validators.required]],
      po_no : [null , [Validators.required]],
      planned_delivery_date : [null , [Validators.required]],
      fob : [null , [Validators.required, PrimaryValidators.isNumber , Validators.min(0)]],
      country : [null , [Validators.required]],
      projection_location : [null , [Validators.required]],
      order_qty : [0 , [Validators.required , Validators.min(0)]],
      excess_presentage : [0 , [Validators.required , Validators.min(0)]],
      planned_qty : [0 , [Validators.required , Validators.min(0)]],
      delivery_status : [null , [Validators.required]],
      ship_mode : [null , [Validators.required]]
    })
    let customErrorMessages = {
      fob : {  'min' : 'Value must be grater than 0'  },
      order_qty : { 'min' : 'Value must be grater than 0' },
      planned_qty : { 'min' : 'Value must be grater than 0' },
      excess_presentage : { 'min' : 'Value must be grater than 0' }
    }
    this.formValidatorDetails = new AppFormValidator(this.formDetails,customErrorMessages)
  }

  //initialize handsontable for customer order line table
  initializeOrderLinesTable(){
    this.hotOptions = {
      columns: [
        { type: 'checkbox', title : 'Action' , readOnly: false , checkedTemplate: 'yes',  uncheckedTemplate: 'no' },
        { type: 'text', title : 'Type' , data: 'type_created'},
        { type: 'text', title : 'Line No' , data: 'line_no' , readOnly: true},
        { type: 'text', title : 'Style Color' , data: 'style_color' , readOnly: true },
        { type: 'text', title : 'PCD' , data: 'pcd' },
        { type: 'text', title : 'RM In Date' , data: 'rm_in_date' },
        { type: 'text', title : 'PO No' , data: 'po_no' },
        { type: 'text', title : 'Planned Deliver Date' , data: 'planned_delivery_date' },
        { type: 'text', title : 'Ship Mode' , data: 'ship_mode' },
        { type: 'text', title : 'FOB' , data: 'fob' },
        { type: 'text', title : 'Country' , data: 'country_description' },
        { type: 'text', title : 'Delivery Status' , data: 'delivery_status' },
        { type: 'text', title : 'Projection Location' , data: 'loc_name' },
        { type: 'text', title : 'Order Qty' , data: 'order_qty' },
        { type: 'text', title : 'Excess Presentage' , data: 'excess_presentage' },
        { type: 'text', title : 'Planned Qty' , data: 'planned_qty' }
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
      cells : function(row, col, prop , value){ //table cell render event. works for every cell in the table
        var cellProperties = {};
        //var data = this.dataset;//this.instance.getData();
        if(col == 1){
          cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
            var args = arguments;
            if(prop == 'type_created' && value == 'GFM'){
              td.style.background = '#ffcccc';
            }
            else if(prop == 'type_created' && value == 'GFS'){
              td.style.background = '#b3ff66';
            }
            Handsontable.renderers.TextRenderer.apply(this, args);
          }
        }

        return cellProperties;
      },
      contextMenu : {
          callback: function (key, selection, clickEvent) {
            // Common callback for all options
          },
          items : {
            'add' : {
              name : 'New Delivery',
              callback : (key, selection, clickEvent) => {
                this.contextMenuAdd()
              }
            },
            'edit' : {
              name : 'View / Edit Delivery',
              disabled: function (key, selection, clickEvent) {
                // Disable option when first row was clicked
                return this.getSelectedLast() == undefined // `this` === hot3
              },
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let start = selection[0].start;
                  this.contextMenuEdit(start.row)
                }
              }
            },
            'size' : {
              name : 'Size Breakup',
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let start = selection[0].start;
                  this.contextMenuSize(start.row)
                }
              }
            },
            'revison' : {
              name : 'Revisions / Origin',
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let start = selection[0].start;
                  let data = this.dataset[start.row]
                  this.buyerPoService.changeRevisionLineData(data)
                }
              }
            },
            'split' : {
              name : 'Split Delivery',
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let start = selection[0].start;
                  let data = this.dataset[start.row]
                  this.buyerPoService.changeSplitLineData(data)
                }
              }
            },
            'merge' : {
              name : 'Merge Deliveries',
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  this.contextMenuMerge()
                }
              }
            },
            /*'remove_row' : {
              name : 'Remove Delivery',
              callback : (key, selection, clickEvent) => {
                if(selection.length > 0){
                  let start = selection[0].start;
                  this.contextMenuRemove(start.row)
                }
              }
            }*/
          }
      }
    }
  }

  //load customer order header data
  loadHeaderFormData(){
    this.loadingHeader = true
    this.loadingCountHeader = 0
    if(!this.initializedHeader){
      this.loadStyles()
      this.initializedHeader = true;
    }
    //this.loadDivisions()
    this.loadCustomerOrderTypes()
    //this.loadOrderStatus()
  }


  //load customer order line data
  loadDetailsFormData(){
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while loading data')
    this.loadingDetails = true;
    this.loadingCountDetails = 0
    if(!this.initializedDetails){
      this.loadCountry()
      this.initializedDetails = true
    }
    this.loadShipModes()
    this.loadLocations()
    this.loadOrderStatus()
    this.loadStyleColors(this.formHeader.get('order_style').value.style_id)
  }

  //chek all data were loaded, if loaded active save button
  checkHeaderLoadingStatus(){
    if(this.loadingCountHeader >= 1){
      this.loadingHeader = false
      this.loadingCountHeader = 0
      setTimeout(() => {
        AppAlert.closeAlert()
      } , 1000)
    }
  }


  //chek all data were loaded, if loaded active save button
  checkDetailsLoadingStatus(){
    if(this.loadingCountDetails >= 4){
      this.loadingDetails = false
      this.loadingCountDetails = 0
      setTimeout(() => {
        AppAlert.closeAlert()
      } , 1000)
    }
  }

  //check header data was loaded for selected customer order
  checkOrderOpenStatus(){
    if(this.loadingCountHeader >= 1){
      this.loadingHeader = false
      this.loadingCountHeader = 0
      setTimeout(() => {
        AppAlert.closeAlert()
      } , 1000)
    }
  }


  //fire when click context menu - add
  contextMenuAdd(){
    this.formDetails.reset()
    this.saveStatusDetails = 'SAVE'
    this.modelTitle = 'Add Order Line'
    this.detailsModel.show()
    this.currentDataSetIndex = -1
  }


  //context menu - edit
  contextMenuEdit(row){
    let selectedRowData = this.dataset[row]
    this.currentDataSetIndex = row
    this.loadOrderLineDetails(selectedRowData['details_id'])
    this.saveStatusDetails = 'UPDATE'
  }


  //context menu - size
  contextMenuSize(row){
    let data = {
      details_id : this.dataset[row]['details_id'],
      order_qty : this.dataset[row]['order_qty'],
      planned_qty : this.dataset[row]['planned_qty'],
      excess_presentage : this.dataset[row]['excess_presentage']
    }
    this.buyerPoService.changeLineData(data)
  }


  //context menu - merge
  contextMenuMerge(){
    let arr = [];
    let str = '';
    for(let x = 0 ; x < this.dataset.length ; x++){
      if(this.dataset[x]['0'] != undefined && this.dataset[x]['0'] == 'yes'){
        arr.push(this.dataset[x]['details_id'])
        str += this.dataset[x]['line_no'] + ',';
      }
    }
    console.log(arr)
    if(arr.length > 1) {
      AppAlert.showConfirm({
        'text' : 'Do you want to merge (' + str + ') lines?'
      },(result) => {
        if (result.value) {
          this.mergerLines(arr)
        }
      })
    }
  }


  //context menu - remove
  /*contextMenuRemove(row){
    let details_id = this.dataset[row]['details_id']
    this.http.delete(this.apiUrl + 'merchandising/customer-order-details/' + details_id)
    .subscribe(data => {
      console.log(data)
    //  debugger

    AppAlert.showConfirm({
      'text' : 'Do you want to delete selected customer order line?'
    },(result) => {
      if (result.value) {
        this.dataset.splice(row, 1)
        const hotInstance = this.hotRegisterer.getInstance(this.instance);
        hotInstance.render()
      }
    })
    })
  }*/


  //save customer order header details
  saveHeader() {

    if(!this.formValidatorHeader.validate())//if validation faild return from the function
      return;
    this.processingHeader = true
    AppAlert.showMessage('Processing...','Please wait while saving details')

    let saveOrUpdate$ = null;
    let formData = this.formHeader.getRawValue();
    formData['order_style'] = formData['order_style']['style_id']

    if(this.saveStatus == 'SAVE') {
      saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/customer-orders', formData)
      this.dataset = [] //clear order details table
    }
    else if(this.saveStatus == 'UPDATE') {
      saveOrUpdate$ = this.http.put(this.apiUrl + 'merchandising/customer-orders/' + formData.order_id , formData)
    }

    saveOrUpdate$
    .pipe( map(res => res['data'] ) )
    .subscribe(
      (res) => {
        this.orderId = res.customerOrder.order_id
        this.orderCode = res.customerOrder.order_code
        this.formHeader.controls.order_status.setValue(res.customerOrder.order_status)
        this.formHeader.controls.order_id.setValue(res.customerOrder.order_id)
        this.saveStatus = 'UPDATE'
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


  //load customer order header
  loadOrderHeaderDetails(id) {
    this.http.get(this.apiUrl + 'merchandising/customer-orders/' + id)
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      this.formHeader.setValue({
        order_id : data.order_id,
        order_style : data.style,
        order_customer : data.order_customer,
        order_division : data.order_division,
        order_type : data.order_type,
        order_status : data.order_status
      })
      this.customerDivisions = data.customer.divisions
      this.orderCode = data.order_code
      this.styleDescription = data.style.style_description
      this.customerDetails = data.customer.customer_code + ' / ' + data.customer.customer_name

      this.loadingCountHeader++;//use to view and hide loading message
      this.checkOrderOpenStatus()
    })
  }


  //clear all data for new customer order
  newOrder() {
    if(this.formHeader.touched || this.formHeader.dirty || this.orderId > 0) {
      AppAlert.showConfirm({
        'text' : 'Do you want to clear all unsaved data?'
      },(result) => {
        if (result.value) {
          this.saveStatus = 'SAVE'
          this.formHeader.reset()
          this.orderId = 0
          this.orderCode = ''
          this.customerDetails = ''
          this.styleDescription = ''
          this.dataset = []
        }
      })
    }
  }


  //save customer order line
  saveDetails()
  {
      if(!this.formValidatorDetails.validate())//if validation faild return from the function
        return;
      this.processingDetails = true
      AppAlert.showMessage('Processing...','Please wait while saving details')

      let formData = this.formDetails.getRawValue()
      formData['pcd'] = formData['pcd'].toISOString().split("T")[0]
      formData['rm_in_date'] = formData['rm_in_date'].toISOString().split("T")[0]
      formData['planned_delivery_date'] = formData['planned_delivery_date'].toISOString().split("T")[0]
      formData['order_name'] = formData['country']['country_name'],
      formData['country'] = formData['country']['country_id']
      formData['order_id'] = this.orderId;

      if(this.saveStatusDetails == 'SAVE'){
          this.http.post(this.apiUrl + 'merchandising/customer-order-details' , formData)
          .pipe( map(res => res['data']) )
          .subscribe(data => {
            //console.log(data)
            if(data.customerOrderDetails.delivery_status != 'CANCEL'){ //add new line to table if it's status != CANCEL
              this.dataset.push(data.customerOrderDetails)
            }
            this.formDetails.reset()
            this.snotifyService.success('Customer order line saved successfully', this.tosterConfig)
            const hotInstance = this.hotRegisterer.getInstance(this.instance);
            hotInstance.render()
            this.processingDetails = false
            setTimeout(() => { AppAlert.closeAlert() } , 1000)
          },
          error => {
            this.processingDetails = false
            setTimeout(() => {
              AppAlert.closeAlert()
              AppAlert.showError({ text : 'Process Error' })
            } , 1000)
            //this.snotifyService.error('Inserting Error', this.tosterConfig)
          }
        )
      }
      else if(this.saveStatusDetails == 'UPDATE') {
        this.http.put(this.apiUrl + 'merchandising/customer-order-details/' + formData['details_id']  , formData)
        .pipe( map(res => res['data']) )
        .subscribe(
          data => {
            //console.log(data)
            if(data.customerOrderDetails.delivery_status == 'CANCEL'){ //remove line from table if status = CANCEL
              this.dataset.splice(this.currentDataSetIndex,1);
            }
            else{
              this.dataset[this.currentDataSetIndex] = data.customerOrderDetails
            }
            this.formDetails.reset()
            this.detailsModel.hide()
            this.snotifyService.success(data.message, this.tosterConfig);
            const hotInstance = this.hotRegisterer.getInstance(this.instance);
            hotInstance.render()
            this.processingDetails = false
            setTimeout(() => { AppAlert.closeAlert() } , 1000)
        },
        error => {
          this.processingDetails = false
          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showError({ text : 'Process Error' })
          } , 1000)
          //this.snotifyService.error('Updating Error', this.tosterConfig);
        }
      )
      }
  }

  //calculate planned qty when change order qty and excess presentage
  calculatePlannedQty(){
    let orderQty = this.formDetails.get('order_qty').value
    let excessPresentage = this.formDetails.get('excess_presentage').value
    let plannedQty = Math.ceil(((orderQty * excessPresentage) / 100) + orderQty)
    this.formDetails.patchValue({planned_qty : plannedQty})
  }


  loadOrderLineDetails(id){
    this.http.get(this.apiUrl + 'merchandising/customer-order-details/' + id)
    .pipe( map(res => res['data']))
    .subscribe(data => {
        this.modelTitle = 'Update Order Details'
        this.saveStatusDetails = 'UPDATE'
        this.formDetails.setValue({
          details_id : data['details_id'],
          style_color : data['style_color'],
          style_description : data['style_description'],
          pcd : new Date(data['pcd']),
          rm_in_date : new Date(data['rm_in_date']),
          po_no : data['po_no'],
          planned_delivery_date : new Date(data['planned_delivery_date']),
          fob : data['fob'],
          country : data['order_country'],
          projection_location : data['projection_location'],
          order_qty : data['order_qty'],
          excess_presentage : data['excess_presentage'],
          planned_qty : data['planned_qty'],
          delivery_status : data['delivery_status'],
          ship_mode : data['ship_mode']
        })
        this.detailsModel.show()
    })
  }

  //merge multiple
  mergerLines(lines){
    AppAlert.showMessage('Processing...','Please wait while merging details')
    this.http.post(this.apiUrl + 'merchandising/customer-order-details/merge' , { 'lines' : lines } )
    .pipe( map( res => res['data']) )
    .subscribe(
      data => {
        if(data.status == 'success'){
          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showSuccess({ text : data.message });
          } , 1000)
          this.loadOrderLines(this.orderId)
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


  //model show event
  modelShowEvent(e) {
    this.loadDetailsFormData()
  }


  //customer order header style change event
  changeStyle(data) {
    if(data == undefined){
      this.customerId = null;
      this.customerDetails = ''
    }
    else{
      this.customerId = data.customer_id;
      this.styleDescription = data.style_description
      this.http.get(this.apiUrl + 'org/customers/'+this.customerId)
      .pipe( map(res => res['data'] ))
      .subscribe(
        data => {
          this.customerDetails = data.customer_code + ' / ' + data.customer_name
          this.customerDivisions = data.divisions
        },
        error => {
          console.log(error)
        }
      )
      this.customerDetails = ''
    }
    console.log(data)
  }

  //load styles list
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

   //load country list
   loadCountry() {
        this.country$ = this.countryInput$
        .pipe(
           debounceTime(200),
           distinctUntilChanged(),
           tap(() => this.countryLoading = true),
           switchMap(term => this.http.get<Country[]>(this.apiUrl + 'org/countries?type=auto' , {params:{search:term}})
           .pipe(
               //catchError(() => of([])), // empty list on error
               tap(() => this.countryLoading = false)
           ))
        );
    }


   /*formValidateHeader(){ //validate the form on input blur event
       this.appValidatorHeader.validate();
   }*/

   /*formValidateDetails(){ //validate the form on input blur event
       this.appValidatorDetails.validate();

   }*/

   //show style color discription when code chane
   styleColorChange() {
     this.formDetails.get('style_description').setValue('Test style description')
   }


   //load customer order lines
   loadOrderLines(id){
     this.dataset = []
     this.http.get(this.apiUrl + 'merchandising/customer-order-details?order_id='+id)
     .pipe( map(res => res['data']) )
     .subscribe(data => {
       this.dataset = data
       /*const hotInstance = this.hotRegisterer.getInstance(this.instance)
       hotInstance.render()*/
       /*setTimeout(() => {
         AppAlert.closeAlert()
       } , 1000)*/
     })
   }


   //load customer order header divisions
   loadDivisions(){
     this.divisions$ = this.http.get<Division[]>(this.apiUrl + 'org/divisions?active=1&fields=division_id,division_description')
     .pipe(
       tap(res => {
         this.loadingCountHeader++;
         this.checkHeaderLoadingStatus()
       }),
       map(res => res['data'])
     )
   }

   //load customer order types
   loadCustomerOrderTypes(){
     this.orderTypes$ = this.http.get<OrderType[]>(this.apiUrl + 'merchandising/customer-order-types?active=1')
     .pipe(
       tap(res => {
         this.loadingCountHeader++;
         this.checkHeaderLoadingStatus()
       }),
       map(res => res['data'])
     )
   }


   loadOrderStatus(){
     this.orderStatus$ = this.http.get<string[]>(this.apiUrl + 'core/status?type=CUSTOMER_ORDER')
     .pipe(
       tap(res => {
         this.loadingCountDetails++;
         this.checkDetailsLoadingStatus()
       }),
       map(res => res['data'])
     )
   }


   //load order line ship modes
   loadShipModes(){
     this.shipModes$ = this.http.get<string[]>(this.apiUrl + 'org/ship-modes?active=1&fields=ship_mode')
     .pipe(
       tap(res => {
         this.loadingCountDetails++;
         this.checkDetailsLoadingStatus()
       }),
       map(res => res['data'])
     )
   }

   //load order line projection locations
   loadLocations(){
     this.locations$ = this.http.get<string[]>(this.apiUrl + 'org/locations?active=1&fields=loc_id,loc_name')
     .pipe(
       tap(res => {
         this.loadingCountDetails++;
         this.checkDetailsLoadingStatus()
       }),
       map(res => res['data'])
     )
   }

   //load order line style colors
   loadStyleColors(style){
     this.colors$ = this.http.get<Array<any>>(this.apiUrl + 'merchandising/customer-order-details?type=style_colors&style='+style)
     .pipe(
       tap(res => {
         this.loadingCountDetails++;
         this.checkDetailsLoadingStatus()
       }),
       map(res => res['data'])
     )
   }

}
