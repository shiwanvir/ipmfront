import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HotTableRegisterer } from '@handsontable/angular';

import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';
import { BuyerPoService } from '../buyer-po.service';
import { AppFormValidator } from '../../../core/validation/app-form-validator';

//models
import { Country } from '../../../org/models/country.model';
import { Location } from '../../../org/models/location.model';


@Component({
  selector: 'app-po-split',
  templateUrl: './po-split.component.html',
  styleUrls: ['./po-split.component.css']
})
export class PoSplitComponent implements OnInit {

  @ViewChild(ModalDirective) splitModel: ModalDirective;
  formGroup : FormGroup
  formSplit : FormGroup
  readonly apiUrl = AppConfig.apiUrl()
  modelTitle = 'Split Customer Order Line'
  formValidatorDetails : AppFormValidator
  formValidatorSplit : AppFormValidator
  //splitList : boolean = true
  orderLineData = null

  dataset: any[] = [];
  hotOptions: any
  instance: string = 'hot';
  currentSplitLine : number = -1

  locations$ : Observable<Location[]>
  country$: Observable<Country[]>;//use to load country list in ng-select
  countryLoading = false;
  countryInput$ = new Subject<string>();
  orderStatus$ : Observable<Array<string>>
  shipModes$ : Observable<Array<string>>

  constructor(private buyerPoService : BuyerPoService , private fb : FormBuilder , private http:HttpClient , private hotRegisterer: HotTableRegisterer) { }

  ngOnInit() {

    this.initializeSplitForm()
    this.initializeTable()

    //listen to split menu in StyleBuyerPoComponent
    this.buyerPoService.splitLineData.subscribe(data => {
      if(data != null){
        this.orderLineData = data
        this.formSplit.setValue({
          planned_qty : data['planned_qty'],
          split_line_no : 1
        })
        this.splitModel.show()
      }
      else{
        this.orderLineData = null;
      }
    })

  }

  //initialize split form
  initializeSplitForm(){
      this.formSplit = this.fb.group({
        planned_qty : 0,
        split_line_no : [1 , [Validators.required,Validators.min(1)]]
      });
      this.formValidatorSplit = new AppFormValidator(this.formSplit,{})
  }


  initializeTable(){
    this.hotOptions = {
      /*data: [{id: 1}],*/
      columns: [
        /*{ type: 'text', title : '#' , data: 'details_id' , readOnly: false},*/
        { type: 'text', title : 'Style Color' , data: 'style_color' , readOnly: false },
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
      /*fixedColumnsLeft: 3,*/
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 200,
      stretchH: 'all',
      selectionMode: 'range',
      /*columnSorting: true,*/
      className: 'htCenter htMiddle',
      readOnly: true,
      /*colWidths: 100,*/
      contextMenu : {
          callback: function (key, selection, clickEvent) {
            // Common callback for all options
            console.log(clickEvent);
          },
          items : {
            'remove_all' : {
              name : 'Remove All Rows',
              disabled: function (key, selection, clickEvent) {
                // Disable option when first row was clicked
                return this.getSelectedLast() == undefined // `this` === hot3
              },
              callback : (key, selection, clickEvent) => {
                AppAlert.showConfirm({
                  'text' : 'Do you want to delete all split lines?'
                },(result) => {
                  if (result.value) {
                    this.dataset = []
                    const hotInstance = this.hotRegisterer.getInstance(this.instance);
                    hotInstance.render()
                  }
                })
              }
            }
          }
      }
    }
  }

  //split delivery and show in table
  addNewSplit(){
    if(!this.formValidatorSplit.validate())//if validation faild return from the function
      return;

    var orderQty = this.orderLineData.order_qty;
    //var plannedQty = this.orderLineData.planned_qty;//this.formSplit.get('planned_qty').value
    var excessPresentage = this.orderLineData.excess_presentage;
    var splitNo = this.formSplit.get('split_line_no').value
    //alert(this.orderLineData.excess_presentage);
    var splitOrderQty = Math.ceil(orderQty / splitNo)
    // splitPlannedQty = Math.ceil(plannedQty / splitNo)
    var splitPlannedQty = Math.ceil(((splitOrderQty * excessPresentage) / 100) + splitOrderQty)
    for(let x = 0 ; x < splitNo ; x++){
      var data = Object.assign({}, this.orderLineData);
      data.order_qty = splitOrderQty
      data.planned_qty = splitPlannedQty
      this.dataset.push(data)
    }
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    hotInstance.render()
  }


  //clear form data
  clearData(){
    AppAlert.showConfirm({
      'text' : 'Do you want to clear split lines?'
    },
    (result) => {
      if (result.value) {
        this.dataset = []
        const hotInstance = this.hotRegisterer.getInstance(this.instance)
        hotInstance.render()
      }
    })
  }

  //model show event
  modelShowEvent(e){
      this.dataset = [];
  }


  //save split line details
  saveSplitLines(){
    AppAlert.showConfirm({
      'text' : 'Do you want to save split lines?'
    },
    (result) => {
      if (result.value) {
        if(this.dataset.length <= 0)//if validation faild return from the function
          return;
        var data = {
          split_count : this.dataset.length,
          delivery_id : this.orderLineData.details_id
        }
        AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Processing...','Please wait while spliting delivery')

        this.http.post(this.apiUrl + 'merchandising/customer-order-details/split-delivery' , data)
        .pipe( map(res => res['data']) )
        .subscribe(
          data => {
            this.dataset = []
            this.buyerPoService.changeSplitStatus(true)
            this.splitModel.hide()
            setTimeout(() => {
              AppAlert.closeAlert()
              AppAlert.showSuccess({ text : data.message })
            } , 1000)
         },
        err => {
          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showError({ text : 'Process Error' })
          } , 1000)
        })
      }
    })
  }



}
