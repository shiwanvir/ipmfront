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

@Component({
  selector: 'app-prl-list',
  templateUrl: './prl-list.component.html',
  styleUrls: ['./prl-list.component.css']
})
export class PrlListComponent implements OnInit {

  @ViewChild(ModalDirective) detailsModel: ModalDirective;
  instance: string = 'instance';
  readonly apiUrl = AppConfig.apiUrl()

  formHeader : FormGroup
  formValidatorHeader : AppFormValidator
  saveStatus = 'SAVE'
  dataset: any[] = [];
  hotOptions: any

  constructor(private fb:FormBuilder , private http:HttpClient , private hotRegisterer: HotTableRegisterer ,
   private snotifyService: SnotifyService) { }

  ngOnInit() {
    this.initializePRLTable();
  }

  //initialize handsontable for customer order line table
  initializePRLTable(){
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
        //if(col == 1){
        //  cellProperties['renderer'] = function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
      //      var args = arguments;
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
                  //this.contextMenuMerge()
                }
              }
            },

          }
      }
    }
  }


}
