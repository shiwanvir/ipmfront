import { Component, OnInit, ViewChild } from '@angular/core';
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
import { AppValidator } from '../../../core/validation/app-validator';
import { PoService } from '../po.service';

import { Location } from '../../../org/models/location.model';
import { Currency } from '../../../org/models/currency.model';

@Component({
  selector: 'app-purchase-order-home',
  templateUrl: './purchase-order-home.component.html',
  styleUrls: ['./purchase-order-home.component.css']
})
export class PurchaseOrderHomeComponent implements OnInit {

  apiUrl:string = AppConfig.apiUrl()
  @ViewChild(ModalDirective) detailsModel: ModalDirective;

  instance: string = 'hot';
  appValidatorHeader : AppValidator
  appValidatorDetails : AppValidator
  saveStatus = 'SAVE'
  saveStatusDetails : string = 'SAVE'
  modelTitle = 'PURCHASE ORDER'
  modelTableTitle = ''
  orderId = ''
  Currency = ''
  orderCode = ''
  customerDetails = ''
  styleDescription = ''
  currentDataSetIndex : number = -1


  mainLocationList$ : Observable<any[]>
  mainSuplierList$ : Observable<any[]>

  currency$: Observable<Currency[]> //use to load currency list in ng-select
  currencyLoading = false;
  currencyInput$ = new Subject<string>();
  selectedCurrency: Currency[] = <any>[];



  //hot table variables ...............................................
  dataset: any[] = [];
  hotOptions: any

tosterConfig = { timeout: 2000, showProgressBar: false, closeOnClick: false , position: SnotifyPosition.rightTop,}

  formHeader : FormGroup
  formDetails : FormGroup

  formFieldsHeader = {
    po_id :'',
    po_type : '',
    po_deli_loc : '',
    po_sup_code : '',
    po_def_cur : '',
    order_type : '',
    po_number : '',
    po_status : ''
  }

  formFieldsDetails = {
    id : '',
    sc_no : '',
    style : '',
    colour : '',
    size : '',
    item_code : '',
    remarks : '',
    req_qty : '',
    unit_price : '',
    uom : '',
    deli_date : '',
    po_no : ''
  }

  constructor(private fb:FormBuilder , private http:HttpClient , private hotRegisterer: HotTableRegisterer, private snotifyService: SnotifyService,
    private poService : PoService) { }

   ngOnInit() {

     this.formDetails = this.fb.group({
       id : 0,
       sc_no : [null , [Validators.required]],
       style : [null , [Validators.required]],
       colour : [null , [Validators.required]],
       size : [null , [Validators.required]],
       item_code : [null , [Validators.required]],
       remarks : [null , [Validators.required]],
       req_qty : [null , [Validators.required]],
       unit_price : [null , [Validators.required]],
       uom : [null , [Validators.required]],
       deli_date : [null , [Validators.required]],
       po_no : null

     })


     this.formHeader = this.fb.group({
       po_id : 0,
       po_type : [null , [Validators.required]],
       po_deli_loc : [null , [Validators.required]],
       po_sup_code : [null , [Validators.required]],
       po_def_cur : [null , [Validators.required]],
       order_type : [null , [Validators.required]],
       po_number : null,
       po_status : null
     })

     //create new validation object
     this.appValidatorHeader = new AppValidator(this.formFieldsHeader,{},this.formHeader);

     this.formHeader.valueChanges.subscribe(data => { //validate form when form value changes
       //console.log(data)
       this.appValidatorHeader.validate();
     })

     //create new validation object
     this.appValidatorDetails = new AppValidator(this.formFieldsDetails,{},this.formDetails);

     this.formDetails.valueChanges.subscribe(data => { //validate form when form value changes
      // console.log(data)
       this.appValidatorDetails.validate();
     })

     this.loadCompanies();
     this.loadSupliers();
     this.loadCurrency();
     this.initializeOrderDetailsTable();

     this.poService.poData.subscribe(data => {
       //alert('ddd')
       if(data != null){
         this.saveStatus = 'UPDATE'
         this.orderId = data
         this.viewHeader(this.orderId)
         this.loadOrderDetails(this.orderId)
         var element = <HTMLInputElement> document.getElementById("po_type");
         element.disabled = true;
         const hotInstance = this.hotRegisterer.getInstance(this.instance);
         hotInstance.render()
       }
     })


     this.poService.poData2.subscribe(data => {
       //alert('ddd')
       if(data != null){
         this.saveStatus = 'UPDATE'
         this.orderId = data
         this.viewHeader2(this.orderId)
         this.loadOrderDetails2(this.orderId)
         var element = <HTMLInputElement> document.getElementById("po_type");
         element.disabled = true;
         const hotInstance = this.hotRegisterer.getInstance(this.instance);
         hotInstance.render()
       }
     })
   }


   initializeOrderDetailsTable(){
     this.hotOptions = {
       /*data: [{id: 1}],

       sc_no : data['sc_no'],
       style : data['style'],
       colour : data['colour'],
       size : data['size'],

       */
       columns: [

         { type: 'text', title : 'Item Code' , data: 'item_code' },
         { type: 'text', title : 'SC Number' , data: 'sc_no'},
         { type: 'text', title : 'Brand' , data: 'item_code'},
         { type: 'text', title : 'Description' , data: 'item_code' },
         { type: 'text', title : 'Qty' , data: 'req_qty' },
         { type: 'text', title : 'Unit Price' , data: 'unit_price' },
         { type: 'text', title : 'Total' , data: 'tot_qty' },
         { type: 'text', title : 'UOM' , data: 'uom' },
         { type: 'text', title : 'Delivery Date' , data: 'deli_date' },
         { type: 'text', title : 'Status' , data: 'status' }

       ],
       /*fixedColumnsLeft: 3,*/
       manualColumnResize: true,
       autoColumnSize : true,
       rowHeaders: true,
       height: 250,
       stretchH: 'all',
       selectionMode: 'range',
       /*columnSorting: true,*/
       className: 'htCenter htMiddle',
       readOnly: true,
       cells : function(row, col, prop , value){
         var cellProperties = {};
         return cellProperties;
       },

       contextMenu : {
           callback: function (key, selection, clickEvent) {
           console.log(clickEvent);
           },
           items : {
             'remove_row' : {
               callback : (key, selection, clickEvent) => {
                 if(selection.length > 0){
                   let start = selection[0].start;
                   let details_id = this.dataset[start.row]['details_id']
                   this.http.delete(this.apiUrl + 'merchandising/customer-order-details/' + details_id)
                   .subscribe(data => {
                    console.log(data)
                   AppAlert.showConfirm({
                     'text' : 'Do you want to delete selected customer order line?'
                   },(result) => {
                     if (result.value) {
                             this.dataset.splice(start.row, 1)
                             const hotInstance = this.hotRegisterer.getInstance(this.instance);
                             hotInstance.render()
                     }
                   })
                   })
                 }
               }
             },
             'edit' : {
               name : 'Edit Row',
               disabled: function (key, selection, clickEvent) {
                 // Disable option when first row was clicked
                 return this.getSelectedLast() == undefined // `this` === hot3
               },
               callback : (key, selection, clickEvent) => {

                 //console.log(selection)
                 const hotInstance = this.hotRegisterer.getInstance(this.instance);
                 for(let x = 0 ; x < selection.length ; x++){
                   let start = selection[x].start;
                   let end = selection[x].end;
                   let selectedRowData = this.dataset[start.row]
                   this.currentDataSetIndex = start.row
                   let typeofPo = this.formHeader.get('po_type').value
                   if(typeofPo == 'General'){

                     var element = <HTMLInputElement> document.getElementById("sc_num");
                     element.disabled = true;
                     var element1 = <HTMLInputElement> document.getElementById("style_num");
                     element1.disabled = true;
                     var element2 = <HTMLInputElement> document.getElementById("colour_code");
                     element2.disabled = true;
                     var element3 = <HTMLInputElement> document.getElementById("size_item");
                     element3.disabled = true;

                     this.viewDetails(selectedRowData['id'])
                   }else{
                     this.viewDetails2(selectedRowData['id'])
                   }

                   console.log(selectedRowData['id'])
                   this.saveStatusDetails = 'UPDATE'
                 }

               }
             },
             'add' : {
               name : 'Inser New',
               callback : () => {
                 this.formDetails.reset()
                 this.formDetails.patchValue({po_no: this.formHeader.get('po_number').value });
                 this.saveStatusDetails = 'SAVE'
                 this.modelTitle = 'Add Purchase Order Details'
                 let typeofPo = this.formHeader.get('po_type').value
                 console.log(typeofPo)
                 if(typeofPo == 'General'){

                   var element = <HTMLInputElement> document.getElementById("sc_num");
                   element.disabled = true;
                   var element1 = <HTMLInputElement> document.getElementById("style_num");
                   element1.disabled = true;
                   var element2 = <HTMLInputElement> document.getElementById("colour_code");
                   element2.disabled = true;
                   var element3 = <HTMLInputElement> document.getElementById("size_item");
                   element3.disabled = true;

                   this.detailsModel.show()

                 }else{



                   this.detailsModel.show()
                 }

                 this.currentDataSetIndex = -1
               }
             },

           }
       }
     }
   }

   modelShowEvent(e) {
     //this.loadDetailsFormData()
   }

   saveHeader() {
     //alert()
     let saveOrUpdate$ = null;
     let ordId = this.formHeader.get('po_id').value
     let typeofPo = this.formHeader.get('po_type').value
     let formData = this.formHeader.getRawValue();
     formData['po_def_cur'] = formData['po_def_cur']['currency_id']

     if(typeofPo == 'General')
     {
       if(this.saveStatus == 'SAVE') {
         console.log(formData)
       saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/po-general', formData)
       }
       else if(this.saveStatus == 'UPDATE') {
       saveOrUpdate$ = this.http.put(this.apiUrl + 'merchandising/po-general/' + ordId , formData)
       }
     }else{

       if(this.saveStatus == 'SAVE') {
       console.log(formData)
       saveOrUpdate$ = this.http.post(this.apiUrl + 'merchandising/po-manual', formData)
       }
       else if(this.saveStatus == 'UPDATE') {
       saveOrUpdate$ = this.http.put(this.apiUrl + 'merchandising/po-manual/' + ordId , formData)
       }

     }

     saveOrUpdate$.subscribe(
       (res) => {
         AppAlert.showSuccess({text : res.data.message })
         this.orderId = res.order_id

         document.getElementById("cle_hed").style.display = "block";
         document.getElementById("sav_hed").style.display = "none";
         //this.formHeader.get('po_number').value = res.data.savepo['po_number'];
         this.formHeader.patchValue({po_number: res.data.savepo['po_number'] });
         this.formDetails.patchValue({po_no: res.data.savepo['po_number'] });
         //this.formHeader.get('po_status').value = res.data.status ;
         this.formHeader.patchValue({po_status: res.data.status });


      },
      (error) => {
          console.log(error)
      }
    );
   }


   viewHeader(id) {
     //alert(id)
     this.http.get(this.apiUrl + 'merchandising/po-general/' + id)
     .pipe( map(res => res['data']) )

     .subscribe(data => {


       this.formHeader.setValue({
         po_id : data.po_id,
         po_type : data.po_type,
         po_deli_loc : data.po_deli_loc,
         po_sup_code : data.po_sup_code,
         po_def_cur : data.currency,
         order_type : 'General',
         po_number : data.po_number,
         po_status : data.po_status
       })
       var element = <HTMLInputElement> document.getElementById("or_type");
       element.disabled = true;

     })
   }

   viewHeader2(id) {
     //alert(id)
     this.http.get(this.apiUrl + 'merchandising/po-manual/' + id)
     .pipe( map(res => res['data']) )

     .subscribe(data => {

       this.formHeader.setValue({
         po_id : data.po_id,
         po_type : data.po_type,
         po_deli_loc : data.po_deli_loc,
         po_sup_code : data.po_sup_code,
         po_def_cur : data.currency,
         order_type : data.order_type,
         po_number : data.po_number,
         po_status : data.po_status
       })


     })
   }


   saveDetails()
   {
     let typeofPo = this.formHeader.get('po_type').value
     let formData = this.formDetails.getRawValue();
     formData['deli_date'] = formData['deli_date'].toISOString().split("T")[0]

     if(typeofPo == 'General')
     {

       if(this.saveStatusDetails == 'SAVE'){

         AppAlert.showMessage('Processing...','Please wait while saving details')
         this.http.post(this.apiUrl + 'merchandising/po-general-details' , formData)
         .subscribe(data => {

         //this.dataset.push(data.data.PurchaseOrderDetails)
         this.dataset.push(data['data']['PurchaseOrderDetails'])
         this.formDetails.reset()
         this.snotifyService.success('Purchase order line saved successfully', this.tosterConfig)
         this.formDetails.patchValue({po_no: this.formHeader.get('po_number').value });
         const hotInstance = this.hotRegisterer.getInstance(this.instance);
         hotInstance.render()

         setTimeout(() => { AppAlert.closeAlert() } , 1000)
          },
         error => {
           this.snotifyService.error('Inserting Error', this.tosterConfig)
         })

         }
         else if(this.saveStatusDetails == 'UPDATE') {

           this.http.put(this.apiUrl + 'merchandising/po-general-details/' + formData['id']  , formData)
           .pipe( map(res => res['data']) )
           .subscribe(
             data => {
               console.log(data)
               this.dataset[this.currentDataSetIndex] = data.PurchaseOrderDetails
               this.formDetails.reset()
               this.detailsModel.hide()
               this.snotifyService.success(data.message, this.tosterConfig);
               const hotInstance = this.hotRegisterer.getInstance(this.instance);
               hotInstance.render()
               setTimeout(() => { AppAlert.closeAlert() } , 1000)
           },
           error => {
             this.snotifyService.error('Updating Error', this.tosterConfig);
           }
         )


   }
 }else{

   if(this.saveStatusDetails == 'SAVE'){

     AppAlert.showMessage('Processing...','Please wait while saving details')
     this.http.post(this.apiUrl + 'merchandising/po-manual-details' , formData)
     .subscribe(data => {

     //this.dataset.push(data.data.PurchaseOrderDetails)
     this.dataset.push(data['data']['PurchaseOrderDetails'])
     this.formDetails.reset()
     this.snotifyService.success('Purchase order line saved successfully', this.tosterConfig)
     this.formDetails.patchValue({po_no: this.formHeader.get('po_number').value });
     const hotInstance = this.hotRegisterer.getInstance(this.instance);
     hotInstance.render()

     setTimeout(() => { AppAlert.closeAlert() } , 1000)
      },
     error => {
       this.snotifyService.error('Inserting Error', this.tosterConfig)
     })

     }

     else if(this.saveStatusDetails == 'UPDATE') {

       this.http.put(this.apiUrl + 'merchandising/po-manual-details/' + formData['id']  , formData)
       .pipe( map(res => res['data']) )
       .subscribe(
         data => {
           console.log(data)
           this.dataset[this.currentDataSetIndex] = data.PurchaseOrderDetails
           this.formDetails.reset()
           this.detailsModel.hide()
           this.snotifyService.success(data.message, this.tosterConfig);
           const hotInstance = this.hotRegisterer.getInstance(this.instance);
           hotInstance.render()
           setTimeout(() => { AppAlert.closeAlert() } , 1000)
       },
       error => {
         this.snotifyService.error('Updating Error', this.tosterConfig);
       }
     )


}






 }

}

   viewDetails(id){
     //alert('test')
     this.http.get(this.apiUrl + 'merchandising/po-general-details/' + id)
     .pipe( map(res => res['data']))
     .subscribe(data => {
       //alert(data['item_code'])
         this.modelTitle = 'Update Order Details'
         this.saveStatusDetails = 'UPDATE'
         this.formDetails.setValue({

           id : data['id'],
           sc_no : '',
           style : '',
           colour : '',
           size : '',
           item_code : data['item_code'],
           remarks : data['remarks'],
           req_qty : data['req_qty'],
           unit_price : data['unit_price'],
           uom : data['uom'],
           deli_date : new Date(data['deli_date']),
           po_no : data['po_no'],

         })
        this.detailsModel.show()
     })
   }

   viewDetails2(id){
     //alert('test')
     this.http.get(this.apiUrl + 'merchandising/po-manual-details/' + id)
     .pipe( map(res => res['data']))
     .subscribe(data => {
       //alert(data['item_code'])
         this.modelTitle = 'Update Order Details'
         this.saveStatusDetails = 'UPDATE'
         this.formDetails.setValue({

           id : data['id'],
           sc_no : data['sc_no'],
           style : data['style'],
           colour : data['colour'],
           size : data['size'],
           item_code : data['item_code'],
           remarks : data['remarks'],
           req_qty : data['req_qty'],
           unit_price : data['unit_price'],
           uom : data['uom'],
           deli_date : new Date(data['deli_date']),
           po_no : data['po_no'],

         })
        this.detailsModel.show()
     })
   }

   loadOrderDetails(id){
     //alert(id)
     this.dataset = []
     this.http.get(this.apiUrl + 'merchandising/po-general-details?order_id='+id)
     .pipe( map(res => res['data']) )
     .subscribe(data => {
       //console.log(data)

       document.getElementById("general_table").style.display = "block";
       this.dataset = data

       /*const hotInstance = this.hotRegisterer.getInstance(this.instance)
       hotInstance.render()*/
     })
   }

   loadOrderDetails2(id){
     //alert(id)
     this.dataset = []
     this.http.get(this.apiUrl + 'merchandising/po-manual-details?order_id='+id)
     .pipe( map(res => res['data']) )
     .subscribe(data => {
       console.log(data)

       document.getElementById("general_table").style.display = "block";
       this.dataset = data

       /*const hotInstance = this.hotRegisterer.getInstance(this.instance)
       hotInstance.render()*/
     })
   }

   loadCompanies(){
       this.mainLocationList$ = this.http.get<any[]>(this.apiUrl + 'org/locations?active=1&fields=loc_id,loc_name')
       .pipe( map(res => res['data']) )
   }

   loadSupliers(){
       this.mainSuplierList$ = this.http.get<any[]>(this.apiUrl + 'org/suppliers?active=1&fields=supplier_id,supplier_name')
       .pipe( map(res => res['data']) )
   }
   //load currency list
   loadCurrency() {
        this.currency$ = this.currencyInput$
        .pipe(
           debounceTime(200),
           distinctUntilChanged(),
           tap(() => this.currencyLoading = true),
           switchMap(term => this.http.get<Currency[]>(this.apiUrl + 'finance/currencies?type=auto',{params:{search:term}})
            .pipe(
               //catchError(() => of([])), // empty list on error
               tap(() => this.currencyLoading = false)
           ))
        );
    }

   formValidateDetails(){ //validate the form on input blur event
        this.appValidatorDetails.validate();

   }



   newOrder() {

     if(this.formHeader.touched || this.formHeader.dirty || this.orderId > '0') {
       AppAlert.showConfirm({
         'text' : 'Do you want to clear all unsaved data?'
       },(result) => {
         if (result.value) {
           this.saveStatus = 'SAVE'
           this.formHeader.reset()
           this.orderId = '0'
           this.orderCode = ''
           this.customerDetails = ''
           this.styleDescription = ''
           this.dataset = []
           var element = <HTMLInputElement> document.getElementById("po_type");
           element.disabled = false;
         }
       })
     }

   }

change_order_type(){


     let potype = this.formHeader.get('po_type').value;
     if( potype == 'General'){
       var element = <HTMLInputElement> document.getElementById("or_type");
       element.disabled = true;
       this.formHeader.patchValue({order_type: 'General' });
       //this.formHeader.get('order_type').value = 'General';
       document.getElementById("general_table").style.display = "block";
       this.modelTableTitle = 'Purchase Order Details - GENERAL';

     }else{
       var element = <HTMLInputElement> document.getElementById("or_type");
       element.disabled = false;
       //this.formHeader.get('order_type').value = '';
       this.formHeader.patchValue({order_type: '' });
       document.getElementById("general_table").style.display = "block";
       this.modelTableTitle = 'Purchase Order Details - MANUAL';

    }

}

   formValidate(){ //validate the form on input blur event
       this.appValidatorHeader.validate();

 }

 }
