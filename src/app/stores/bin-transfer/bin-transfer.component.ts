import { Component, OnInit, TemplateRef, ViewChild, Input, ElementRef, NgModule  } from '@angular/core';
import {FormBuilder, FormGroup, FormControl, Validators, FormArray} from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { AppConfig } from '../../core/app-config';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {BinTransferModalComponent} from "./bin-transfer-modal/bin-transfer-modal.component";


@Component({
  selector: 'app-bin-transfer',
  templateUrl: './bin-transfer.component.html',
  styleUrls: ['./bin-transfer.component.css']
})
export class BinTransferComponent implements OnInit {
  @ViewChild('binTrModal') public binTrModal:ModalDirective;
  @ViewChild(BinTransferModalComponent) binModal: BinTransferModalComponent;
  binGroup : FormGroup
  apiUrl = AppConfig.apiUrl()

  private transId: Object = [];
  public subStores:  Object = [];
  public bins: Object = [];

  constructor( private fb:FormBuilder, private http:HttpClient) { }


  ngOnInit() {
    this.binGroup = new FormGroup({
      sub_store: new FormControl(),
      bin: new FormControl(),
      id: new FormControl(),
      binData: this.fb.array([])
    })

    this.loadSubStoreList()
    this.loadBinList()
  }

  loadSubStoreList(){
    this.http.get(this.apiUrl + 'stores/load-substores').subscribe(data => {
        this.subStores = data
    })
  }

  loadBinList(){
    this.http.get(this.apiUrl + 'stores/substore-bin-list').subscribe(data => {
      this.bins = data
    })
  }

  showModal(){
    this.binModal.binArr = this.bins;
  }

  closeModal(){
    this.binTrModal.hide()
    //this.clearModelData()
  }

  addBinQty(){
    this.transId = this.binModal.binTransferId;
    this.http.get(this.apiUrl + 'stores/load-added-bin-qty?id='+this.transId).subscribe(res => {

      var count = Object.keys(res['data']).length;
      for (var i = 0; i < count; i++) {
       // console.log(res['data'][i])
          const controls = new FormGroup({
            'style': new FormControl(res['data'][i]['style_no']),
            'item_code': new FormControl(res['data'][i]['master_id']),
            'item': new FormControl(res['data'][i]['master_description']),
            'colour': new FormControl(res['data'][i]['color_name']),
            'size': new FormControl(res['data'][i]['size_name']),
            //'uom': new FormControl(res['data'][i]['uom']),
            'so': new FormControl(2000),
            'qty': new FormControl(res['data'][i]['qty']),

          });

          (<FormArray>this.binGroup.get('binData')).push(controls);

      }
    })

    this.binTrModal.hide()
  }

  saveBinTransfer(){
    this.binGroup.controls['id'].setValue(this.transId);
    var binData = this.binGroup.value;

    //console.log(this.binGroup);
    //this.grnBin.binForm.controls['line_id'].setValue(lineId);

    //console.log(binData);
    this.http.post(this.apiUrl + 'stores/save-bin-transfer',binData).subscribe(data => {
     var massage='';
     return
     /*this.modelForm.reset();
     this.grnGroup.controls['id'].setValue(data['id']);
     this.grnGroup.emit($event);*/
     })
  }

}
