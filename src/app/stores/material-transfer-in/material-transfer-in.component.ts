import { Component, OnInit, ViewChild } from '@angular/core';
import { HotTableModule } from '@handsontable/angular';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';
declare var $:any;

import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

import { MeterialTranferService} from './meterial-transfer.service';

@Component({
  selector: 'app-material-transfer-in',
  templateUrl: './material-transfer-in.component.html',
  styleUrls: ['./material-transfer-in.component.css']
})
export class MaterialTransferInComponent implements OnInit {

  @ViewChild(ModalDirective) matTransInModel: ModalDirective;

  formGroup : FormGroup
  readonly apiUrl = AppConfig.apiUrl()
  appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'
  currentDataSetIndex : number = -1
 instance = null
modelTableTitle = ''
  dataset: any[] = [];
  hotOptions: any

  //to manage form error messages
  formFields = {
    doc_num : '',
    status : '',
    style_no:'',
    style_description : '',
    customer_po_no : '',
    item_code : '',
    material_code : '',
    color_name : '',
    size_name : '',
    bin_name : '',
    uom : '',
    stock_balance : '',
    transfer_qty : '',
    received_qty : ''
  }


  constructor(private fb:FormBuilder , private http:HttpClient, private hotRegisterer: HotTableRegisterer) { }

  ngOnInit() {

    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'org/uom/validate?for=duplicate',
      formFields : this.formFields,
      fieldCode : 'transfer_id',
      /*error : 'Dep code already exists',*/
      data : {
        mat_trans_id : function(controls){ return controls['mat_trans_id']['value']},
        transfer_id : function(controls){ return controls['transfer_id']['value']}
      }
    }

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      gate_pass_no : 0,
      doc_num : 0,
      style_no: [null , [Validators.required]],
      style_description : [null , [Validators.required]],
      customer_po_no : [null , [Validators.required]],
      item_code : [null , [Validators.required]],
      material_code : [null , [Validators.required]],
      color_name : [null , [Validators.required]],
      size_name : [null , [Validators.required]],
      bin_name : [null , [Validators.required]],
      status: [null , [Validators.required]],
      uom : [null , [Validators.required]],
      stock_balance : [null , [Validators.required]],
      transfer_qty : [null , [Validators.required]],
      received_qty : [null , [Validators.required]],
    })

    //create new validation object
    this.appValidator = new AppValidator(this.formFields,{},this.formGroup);

    this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })

    // this.createTable() //load data list
    this.initializeMaterialTransferInTable() //initialize handson table for material transfer in


  }

  initializeMaterialTransferInTable(){
    this.hotOptions = {
      columns: [
      //  { type: 'checkbox', title : 'Action' , readOnly: false , checkedTemplate: 'yes',  uncheckedTemplate: 'no' },
        { type: 'text', title : 'Item Code' , data: 'master_code', readOnly: true},
        { type: 'text', title : 'Description' , data: 'master_description' , readOnly: true},
        { type: 'text', title : 'Customer PO' , data: 'order_code' , readOnly: true },
        { type: 'text', title : 'Style No' , data: 'style_no' , readOnly: true },
        { type: 'text', title : 'Color' , data: 'color_name' , readOnly: true},
        { type: 'text', title : 'Size' , data: 'size_name' , readOnly: true},
        { type: 'text', title : 'Bin' , data: 'store_bin_name' },
        { type: 'text', title : 'UOM' , data: 'uom_code' , readOnly: true},
        { type: 'text', title : 'Stock Balance' , data: 'total_qty',readOnly: true },
        { type: 'text', title : 'Transfer Qty' , data: 'trns_qty', readOnly: true },
        { type: 'text', title : 'Received Qty' , data: 'received_qty' }
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
            // 'add' : {
            //   name : 'New Delivery',
            //   callback : (key, selection, clickEvent) => {
            //     this.contextMenuAdd()
            //   }
            // },
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
          }
      }
    }
  }


      contextMenuEdit(row){
        let selectedRowData = this.dataset[row]
        this.currentDataSetIndex = row
        this.loadOrderLineDetails(selectedRowData['transaction_id'])
        // this.saveStatusDetails = 'UPDATE'
      }



  reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
  }


  //save and update source details
  saveUOM(){
    //this.appValidation.validate();
    let saveOrUpdate$ = null;
    let uomId = this.formGroup.get('mat_trans_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'org/uom', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/uom/' + uomId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        AppAlert.showSuccess({text : res.data.message })
        this.formGroup.reset();
        this.reloadTable()
        this.matTransInModel.hide()
     },
     (error) => {
         console.log(error)
     }
   );
  }

  loadOrderLineDetails(id){
    this.http.get(this.apiUrl + 'store/mat-trans-in/' + id)
    .pipe( map(res => res['data']))
    .subscribe(data => {
        // this.saveStatusDetails = 'UPDATE'
        this.formGroup.setValue({
          transaction_id : data['transaction_id'],
          doc_num : data['doc_num'],
          style_description : data['style_description'],
          customer_po_id : data['customer_po_id'],
          item_code : data['item_code'],
          material_code : data['material_code'],
          customer_name : data['customer_name'],
          color_name : data['color'],
          size_name : data['size'],
          bin_name : data['bin'],
          uom : data['uom'],
          stock_balance : data['stock_balance'],
          transfer_qty : data['transfer_qty'],
          received_qty : data['received_qty']
        })
    })
  }


  // showEvent(event){ //show event of the bs model
  //   this.formGroup.get('uom_code').enable()
  //   this.formGroup.reset();
  //   this.modelTitle = "New UOM"
  //   this.saveStatus = 'SAVE'
  // }

  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }

searchFrom(){
  this.dataset=[];
  let gatePassNo=this.formGroup.get('gate_pass_no').value
        this.dataset = []
      this.http.get(this.apiUrl + 'stores/material-transfer?type=loadDetails&gatePassNo='+gatePassNo)
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      this.dataset = data
      var x=this.dataset.length;
      var i;


})
}

}
