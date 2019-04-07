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

@Component({
  selector: 'app-po-revision',
  templateUrl: './po-revision.component.html',
  styleUrls: ['./po-revision.component.css']
})
export class PoRevisionComponent implements OnInit {

  @ViewChild(ModalDirective) revisionModel: ModalDirective;
  readonly apiUrl = AppConfig.apiUrl()
  modelTitle = 'Delivery Revisions / Origin'
  orderLineData = null
  dataset: any[] = []
  hotOptions = null
  instance : string = 'hot_revision'

  datasetOrigin: any[] = []
  hotOptionsOrigin = null
  instanceOrigin : string = 'hot_origin'

  constructor(private buyerPoService : BuyerPoService , private fb : FormBuilder , private http:HttpClient , private hotRegisterer: HotTableRegisterer) { }

  ngOnInit() {

    this.buyerPoService.revisionLineData.subscribe(data => {
      if(data != null){
        this.orderLineData = data
        this.loadRevisions(data['details_id'])
        if(data['type_created'] == 'GFS' || data['type_created'] == 'GFM'){
          this.loadOrigins(data['details_id'])
        }
        this.revisionModel.show()
      }
      else{
        this.orderLineData = null;
      }
    })

    this.initializeRevisionTable()
    this.initializeOriginTable()
  }


  initializeRevisionTable(){
    this.hotOptions = {
      columns: [
        { type: 'text', title : 'Revision' , data: 'version_no'},
        { type: 'text', title : 'Type' , data: 'type_created'},
        { type: 'text', title : 'Line No' , data: 'line_no' , readOnly: true},
        { type: 'text', title : 'Style Color' , data: 'style_color' , readOnly: true },
        { type: 'text', title : 'PCD' , data: 'pcd' },
        { type: 'text', title : 'RM In Date' , data: 'rm_in_date' },
        { type: 'text', title : 'PO No' , data: 'po_no' },
        { type: 'text', title : 'Planned Deliver Date' , data: 'planned_delivery_date' },
        { type: 'text', title : 'Ship Mode' , data: 'ship_mode' },
        { type: 'text', title : 'FOB' , data: 'fob' },
        /*{ type: 'text', title : 'Country' , data: 'order_country.country_description' },*/
        { type: 'text', title : 'Country' , data: 'country_description' },
        { type: 'text', title : 'Delivery Status' , data: 'delivery_status' },
        //{ type: 'text', title : 'Projection Location' , data: 'order_location.loc_name' },
        { type: 'text', title : 'Projection Location' , data: 'projection_location' },
        { type: 'text', title : 'Order Qty' , data: 'order_qty' },
        { type: 'text', title : 'Excess Presentage' , data: 'excess_presentage' },
        { type: 'text', title : 'Planned Qty' , data: 'planned_qty' }
      ],
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 150,
      stretchH: 'all',
      selectionMode: 'range',
      /*columnSorting: true,*/
      className: 'htCenter htMiddle',
      readOnly: true,
    }
  }



  initializeOriginTable(){
    this.hotOptionsOrigin = {
      columns: [
        { type: 'text', title : 'Revision' , data: 'version_no'},
        { type: 'text', title : 'Type' , data: 'type_created'},
        { type: 'text', title : 'Line No' , data: 'line_no' , readOnly: true},
        { type: 'text', title : 'Style Color' , data: 'style_color' , readOnly: true },
        { type: 'text', title : 'PCD' , data: 'pcd' },
        { type: 'text', title : 'RM In Date' , data: 'rm_in_date' },
        { type: 'text', title : 'PO No' , data: 'po_no' },
        { type: 'text', title : 'Planned Deliver Date' , data: 'planned_delivery_date' },
        { type: 'text', title : 'Ship Mode' , data: 'ship_mode' },
        { type: 'text', title : 'FOB' , data: 'fob' },
        /*{ type: 'text', title : 'Country' , data: 'order_country.country_description' },*/
        { type: 'text', title : 'Country' , data: 'country_description' },
        { type: 'text', title : 'Delivery Status' , data: 'delivery_status' },
        //{ type: 'text', title : 'Projection Location' , data: 'order_location.loc_name' },
        { type: 'text', title : 'Projection Location' , data: 'projection_location' },
        { type: 'text', title : 'Order Qty' , data: 'order_qty' },
        { type: 'text', title : 'Excess Presentage' , data: 'excess_presentage' },
        { type: 'text', title : 'Planned Qty' , data: 'planned_qty' }
      ],
      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      height: 150,
      stretchH: 'all',
      selectionMode: 'range',
      /*columnSorting: true,*/
      className: 'htCenter htMiddle',
      readOnly: true,
    }
  }


  loadRevisions(id){
    this.dataset = []
    this.http.get(this.apiUrl + 'merchandising/customer-order-details/revisions?details_id='+id)
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      this.dataset = data
      /*const hotInstance = this.hotRegisterer.getInstance(this.instance)
      hotInstance.render()*/
    })
  }


  loadOrigins(id){
    this.datasetOrigin = []
    this.http.get(this.apiUrl + 'merchandising/customer-order-details/origins?details_id='+id)
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      this.datasetOrigin = data
      /*const hotInstance = this.hotRegisterer.getInstance(this.instance)
      hotInstance.render()*/
    })
  }


  modelShowEvent(e){

  }

}
