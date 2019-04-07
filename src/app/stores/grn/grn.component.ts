import { Component, OnInit,ViewChild, Input, ElementRef } from '@angular/core';
import {FormBuilder, FormGroup, FormControl, Validators, FormArray} from '@angular/forms';
import { Http, HttpModule, Headers,  Response } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../../core/app-config';
import { Subject, Observable, of, concat } from 'rxjs';
import { map } from 'rxjs/operators';
import {GrnModalComponent} from "./grn-modal/grn-modal.component";
import { ModalDirective } from 'ngx-bootstrap/modal';
import {GrnBinComponent} from "./grn-bin/grn-bin.component";
import { AppAlert } from '../../core/class/app-alert';

@Component({
  selector: 'app-grn',
  templateUrl: './grn.component.html',
  styleUrls: ['./grn.component.css']
  //directives:['GrnModalComponent']
})

export class GrnComponent implements OnInit {
  @ViewChild(ModalDirective) grnModel: ModalDirective;
  @ViewChild(ModalDirective) binModal: ModalDirective;
  @ViewChild(GrnModalComponent) private grnSerch: GrnModalComponent;
  @ViewChild(GrnBinComponent) private grnBin: GrnBinComponent;

  message = "Hellow";

  grnGroup : FormGroup

  modelTitle : string = ""
  name = new FormControl('');
  serverUrl:string = AppConfig.apiServerUrl()
  apiUrl = AppConfig.apiUrl()
  res : string = '';
  private currentLine

  formData$ : Observable<Array<any>>
  childVal:string;

  constructor(private http:HttpClient, private fb: FormBuilder) { }

  ngOnInit() {
    this.grnGroup = new FormGroup({
      po_no: new FormControl(),
      sup_name: new FormControl(),
      invoice_no: new FormControl(),
      id: new FormControl(),
      grn_lines: this.fb.array([])
    });

  }

  getOutPutVal(selected: string){
    if(selected){
      this.childVal = "Value from child : " + selected;
    }
  }

  saveGrn(){
    var grn_lines = this.grnGroup.value;

    this.http.post(this.apiUrl + 'stores/grn',grn_lines).subscribe(data => {
         /* var massage='';
          return
          this.modelForm.reset();
          this.grnGroup.controls['id'].setValue(data['id']);
          this.grnGroup.emit($event);*/
    })
  }

   addPoLineGroup(){
    return this.fb.group({
      poLineId: [],
      balQty: [],
      qty: []
    })
  }

  get poLineArray(){
    return <FormArray>this.grnGroup.get('grn_lines')
  }

  showEvent(event){ //show event of the bs model
    this.modelTitle = "GRN Item"
    this.loadData()
    this.grnSerch.clearModelData()
    this.grnSerch.showModal()
    this.grnSerch.setSelectedPo(this.grnGroup.controls['po_no'].value)
  }


  setLineId(lineId){
    this.currentLine = lineId;
    this.grnBin.binForm.controls['line_id'].setValue(lineId);
    this.grnBin.binForm.controls['id'].setValue(this.grnGroup.controls['id'].value);
  }

  showBinAllocation(){
    this.grnBin.loadBinList()
    this.grnBin.createBinItem(this.currentLine)

   // this.binModel.hide()
  }

  loadDataSavedLines(){
    //this.grnGroup.reset();
    //this.grnGroup.controls['id'] = this.grnSerch.modelForm.controls['id'].value;
    //console.log(this.grnSerch.modelForm.controls['id'].value);
    this.grnGroup.controls['id'].setValue(this.grnSerch.modelForm.controls['id'].value);

    this.http.get(this.apiUrl + 'stores/load-grn-lines?id='+this.grnSerch.modelForm.controls['id'].value).subscribe( res => {
      var count = Object.keys(res['data']).length;

      for (var i = 0; i < count; i++) {
        const controll = new FormGroup({
          'grn_line_id': new FormControl(res['data'][i]['id']),
          'item_code': new FormControl(res['data'][i]['item_code']),
          'sc_no': new FormControl(res['data'][i]['sc_no']),
          'bpo': new FormControl(res['data'][i]['bpo']),
          'buyer': new FormControl(res['data'][i]['customer_name']),
          'master_description': new FormControl(res['data'][i]['master_description']),
          'colour': new FormControl(res['data'][i]['color_name']),
          'size': new FormControl(res['data'][i]['size_name']),
          'uom': new FormControl(res['data'][i]['uom']),
          'bal_qty': new FormControl(res['data'][i]['bal_qty']),
          'qty': new FormControl(res['data'][i]['grn_qty']),
          'po_qty': new FormControl(res['data'][i]['po_qty'])
        });

       (<FormArray>this.grnGroup.get('grn_lines')).push(controll);

      }

    })
  }

  deleteGrnLine(id, i){
    AppAlert.showConfirm({
      'text' : 'Do you want to delete this item?'
    },(result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'stores/grn/' + id).subscribe((data) => {
                  const control = <FormArray>this.grnGroup.controls['grn_lines']
                  control.removeAt(i)
                },
            )
      }
    })
  }

  loadPoInfo(e){
    this.http.get(this.apiUrl + 'merchandising/load-po-header-data',e.target.value).subscribe(data => {
      alert('s')
    })
  }

  loadData(){
    this.grnSerch.loadModal(this.grnGroup.controls['po_no'].value)
    //this.loadDataSavedLines()
  }

  closeModal(){
    this.grnModel.hide()
    this.clearModelData()
  }

  closeBinModal(event){
    //alert('11')
   // this.binModel.hide()
    this.binModal.hide()
  }

  clearModelData(){
    const control = <FormArray>this.grnGroup.controls['grn_lines'];
    for(let i = control.length-1; i >= 0; i--) {
      control.removeAt(i)
    }
  }


}
