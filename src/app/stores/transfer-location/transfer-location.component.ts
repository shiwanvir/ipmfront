import { Component, OnInit , ViewChild} from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject,BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

//third pirt routingComponents
//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';


import { NgOption } from '@ng-select/ng-select';
declare var $:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppAlert } from '../../core/class/app-alert';
import { AppConfig } from '../../core/app-config';
//models
//import {Location} from'../org/models/loction';

@Component({
  selector: 'app-transfer-location',
  templateUrl: './transfer-location.component.html',
  styleUrls: ['./transfer-location.component.css']
})
export class TransferLocationComponent implements OnInit {
  @ViewChild(ModalDirective) detailsModel: ModalDirective;
  instance: string = 'instance';
  //form group for po seraching
  formGroup : FormGroup
  //form  group fro location transfer
  formValidator : AppFormValidator = null
  formGroupDetails:FormGroup
  saveStatusDetails : string = 'SAVE'
  modelTitle : string = "New Silhouette Classification"
  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  formdetailsValidator:AppValidator
  saveStatus = 'SAVE'
  style_to_error :string
  style_from_error:string
  //hansontable variables
  currentDataSetIndex : number = -1
  orderId = 0

  location$: Observable<Location[]>;//use to load customer list in ng-select
  locationLoading = false;
  locationInput$ = new Subject<string>();
  selectedLocation: Location[]

  private lineSource = new BehaviorSubject<string>(null)
  lineData = this.lineSource.asObservable()

  private splitLineSource = new BehaviorSubject<string>(null)
  splitLineData = this.splitLineSource.asObservable()

  private revisionLineSource = new BehaviorSubject<string>(null)
  revisionLineData = this.revisionLineSource.asObservable()



  //hot table variables ...............................................
  dataset: any[] = [];
  hotOptions: any
  temp:any=null;
  formFields = {
      po_from: '',
      style_from:'',
      po_to:'',
      style_to:'',
      validation_error :'',
      loc_name:''

  }

  formValidatorDetails={
    item_code:'',
    description:'',
    color:'',
    size:'',
    bin:'',
    uom:'',
    stock_balance:'',
    trns_qty:''

  }


  constructor(private fb:FormBuilder,private http:HttpClient,private hotRegisterer: HotTableRegisterer,) { }

  ngOnInit() {




    this.initializeOrderLinesTable()
    this.formGroup = this.fb.group({
      transfer_location_id : 0,
        po_from : [null , [Validators.required]],
        style_from : [null , [Validators.required]],
        po_to:  [null , [Validators.required]],
        style_to : [null , [Validators.required]],
        loc_name : [null , [Validators.required]/*,[basicValidator.remote(remoteValidationConfig)]*/]
    })
     this.loadLocations()

      // this.formValidator = new AppFormValidator(this.formGroup , {});
    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

  //this.createTable()
  this.formGroupDetails=this.fb.group({
    details_id:0,
    item_code:[null , [Validators.required]],
    description:[null , [Validators.required]],
    color:[null , [Validators.required]],
    size:[null , [Validators.required]],
    bin:[null , [Validators.required]],
    uom:[null , [Validators.required]],
    stock_balance:[null , [Validators.required]],
    trans_qty:[null , [Validators.required]],





  })



    this.formValidator = new AppFormValidator(this.formGroupDetails , {})
  //create new validation object
  this.formdetailsValidator = new AppValidator(this.formValidatorDetails,{},this.formGroupDetails);

  this.formGroupDetails.valueChanges.subscribe(data => { //validate form when form value changes
    this.formdetailsValidator.validate();
  })

  }



  loadLocations() {
       this.location$ = this.locationInput$
       .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          tap(() => this.locationLoading = true),
          switchMap(term => this.http.get<Location[]>(this.apiUrl + 'org/locations?type=auto' , {params:{search:term}})
          .pipe(
              //catchError(() => of([])), // empty list on error
              tap(() => this.locationLoading = false)
          ))
       );
   }

   //initialize handsontable for customer order line table
   initializeOrderLinesTable(){

     this.hotOptions = {
       columns: [
         { type: 'checkbox', title : 'Action' , readOnly: false , checkedTemplate: 'yes',  uncheckedTemplate: 'no' },
         { type: 'text', title : 'Item code' , data: 'master_code'},
         { type: 'text', title : 'Description' , data: 'master_description' , readOnly: true},
         { type: 'text', title : 'Color' , data: 'color_name' , readOnly: true },
         { type: 'text', title : 'Size' , data: 'size_name' },
         { type: 'text', title : 'BIN' , data: 'store_bin_name' },
         { type: 'text', title : 'UOM' , data: 'uom_code' },
         { type: 'text', title : 'Stock Balance' , data: 'total_qty' },
         { type: 'text', title : 'Transfer Qty' , readOnly: false ,data: 'trns_qty' },

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

         let x=this.dataset;

         if(surce!=null){
           let row=surce["0"]["0"];

           if(this.dataset[row]["total_qty"]<surce["0"]["3"]){
             AppAlert.showError({text:"Stock Qty Exceeded"});

             this.dataset[row]['trns_qty'] = 0;


            const hotInstance = this.hotRegisterer.getInstance(this.instance);
            hotInstance.render();





           }

       }

         },

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
                   this.changeRevisionLineData(data)
                 }
               }
             },
             'split' : {
               name : 'Split Delivery',
               callback : (key, selection, clickEvent) => {
                 if(selection.length > 0){
                   let start = selection[0].start;
                   let data = this.dataset[start.row]
                   this.changeSplitLineData(data)
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

   //fire when click context menu - add
   contextMenuAdd(){
     this.formGroupDetails.reset()
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
     this.changeLineData(data)
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

   changeRevisionLineData(data){
     this.revisionLineSource.next(data)
   }

   changeSplitLineData(data){
     this.splitLineSource.next(data)
   }

   changeLineData(data){
     this.lineSource.next(data)
   }


     loadOrderLineDetails(id){
       this.http.get(this.apiUrl + 'merchandising/customer-order-details/' + id)
       .pipe( map(res => res['data']))
       .subscribe(data => {
           this.modelTitle = 'Update Order Details'
           this.saveStatusDetails = 'UPDATE'
           this.formGroupDetails.setValue({
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
             this.loadOrderLines()
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



     //load customer order lines
     loadOrderLines(){

       let style_name=null
       if(this.formGroup.get('style_to').value==this.formGroup.get('style_from').value){
       style_name=this.formGroup.get('style_to').value
      }
      else{
        let style_name=null

      }
       this.dataset = []
       this.http.get(this.apiUrl+ 'stores/transfer-location?type=loadDetails&searchFrom='+style_name)
       .pipe( map(res => res['data']) )
       .subscribe(data => {
         this.dataset = data
         var x=this.dataset.length;
         var i;
         for(i=0;i<x;i++){
           this.dataset[i]['trns_qty']=0;

         }

           //console.log(this.dataset);
          if(data==""){
            AppAlert.showError({text:"No any Record to Load"})
          }

       })
     }




  searchFrom(){
  this.dataset = []
    let poFrom=this.formGroup.get('po_from').value
    let poTo=this.formGroup.get('po_to').value
    let location = this.formGroup.getRawValue();

      if(location['loc_name']==undefined){
        AppAlert.showError({text:"please Select Location"})

      }
      else{
    this.http.get(this.apiUrl + 'stores/transfer-location?type=style&searchFrom='+poFrom+'&searchTo='+poTo)

    .subscribe(data => {

          if(data['styleFrom']==null&&data['styleTo']!=null){
            this.style_from_error="No record exist";
            this.style_to_error=""
            this.formGroup.patchValue({
             style_from :"",
             style_to: data['styleTo']['style_no'],

            })
          this.loadOrderLines()
          }
          else if(data['styleTo']==null&&data['styleFrom']!=null){
            this.style_from_error="";
            this.style_to_error="No record exist"
            this.formGroup.patchValue({
             style_from : data['styleFrom']['style_no'],
             style_to :""

            })
            this.loadOrderLines()
          }
          else if(data['styleTo']==null&&data['styleFrom']==null){
            this.style_from_error="No record exist";
            this.style_to_error="No record exist"
            this.formGroup.patchValue({
             style_from : "",
             style_to :""

            })
            this.loadOrderLines()

          }
          else{
            this.style_to_error="";
            this.style_from_error=""
          this.formGroup.patchValue({
           style_from : data['styleFrom']['style_no'],
           style_to :data['styleTo']['style_no'],

          })
          this.loadOrderLines()
        }

      })


}
  }
  saveDetails(){
    let savedetais$
    let arr=[]
    let location = this.formGroup.getRawValue();
    let receiver_location=location['loc_name']['loc_id'];
    var x=this.dataset.length;
    var i;
    for(i=0;i<x;i++){
      if(this.dataset[i]['trns_qty']!=0){

        savedetais$=this.http.post(this.apiUrl+'stores/transfer-location-store',{'data':this.dataset,'receiver_location':receiver_location});
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


  searchLocation(){

  }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }


  modelShowEvent(e){

  }



}
