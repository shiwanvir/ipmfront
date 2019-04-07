import { Component, OnInit,ViewChild, Input, ElementRef , Output, EventEmitter} from '@angular/core';
import { FormBuilder , FormGroup , FormControl,Validators, FormArray} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { AppConfig } from '../../../core/app-config';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import {strictEqual} from "assert";
import { AppFormValidator } from '../../../core/validation/app-form-validator';
import { AppValidator } from '../../../core/validation/app-validator';


@Component({
  selector: 'app-grn-modal',
  templateUrl: './grn-modal.component.html',
  styleUrls: ['./grn-modal.component.css']
})
export class GrnModalComponent implements OnInit {
  @Input() message: string;
  @Output() modalEmt = new EventEmitter();

  htmlToAdd: string='';
  po_no: string='';

  modalGroup : FormGroup
  apiUrl = AppConfig.apiUrl()

  appValidator: AppFormValidator

  poData$ : Observable<Array<any>>
  scList$ : Observable<Array<any>>
  modalLine$ : Observable<Array<any>>

  poLineHtml: string;
  modelForm:FormGroup

  @Output() opened = new EventEmitter<number>();

  constructor(private http:HttpClient, private fb:FormBuilder) {
    /*this.modelForm = this.fb.group({
      grn_model: this.fb.array([])
    });*/
  }

  ngOnInit() {

    this.modelForm = this.fb.group({
      po_no: new FormControl(),
      id: new FormControl(),
      item_list: this.fb.array([]),
      style_no:null
    })

    let customErrorMessages = {
      qty : {
        required : 'Quantity is empty'
      }
    }

    this.appValidator = new AppFormValidator(this.modelForm, customErrorMessages);
  }

  setSelectedPo(list){
    this.modelForm.controls['po_no'].setValue(list);
    this.po_no = list;
  }

  addPoLineGroup(){
    return this.fb.group({
      sc_no: [],
      bpo: [],
      master_description: [],
      colour: [],
      size: [],
      uom: [],
      bal_qty: []
    })
  }

  saveGrnLines(){
    if(!this.appValidator.validate())//if validation faild return from the function
      return;

    var grn_lines = this.modelForm.value;

    this.http.post(this.apiUrl + 'stores/save-grn-lines',grn_lines)
        .subscribe(data => {
          var massage='';
          //this.modelForm.reset();
          this.modelForm.controls['id'].setValue(data['id']);
          this.modalEmt.emit();
        })

  }

  loadModal(id){
    this.http.get(this.apiUrl + 'merchandising/loadPoLineData?id='+id).subscribe( res => {
      //console.log(res['data'])
      var count = Object.keys(res['data']).length;

      for (var i = 0; i < count; i++) {
        const controll = new FormGroup({
          'po_line_id': new FormControl(res['data'][i]['id']),
          'sc_no': new FormControl(res['data'][i]['sc_no']),
          'bpo': new FormControl(res['data'][i]['bpo']),
          'master_description': new FormControl(res['data'][i]['master_description']),
          'colour': new FormControl(res['data'][i]['colour']),
          'size': new FormControl(res['data'][i]['size']),
          'uom': new FormControl(res['data'][i]['uom']),
          'bal_qty': new FormControl(res['data'][i]['bal_qty']),
          'qty': new FormControl(res['data'][i]['qty'], [Validators.max(res['data'][i]['bal_qty'])]),
          'item_code': new FormControl(res['data'][i]['item_code']),
          'item_select': new FormControl(res['data'][i]['item_select'])
        });

        //console.log(this.modelForm);
        (<FormArray>this.modelForm.get('item_list')).push(controll);

      }

    })

    //var d1 = this.elementRef.nativeElement.querySelector('.html');

  }

  formValidate() { //validate the form on input blur event
    this.appValidator.validate();
  }

  getpoLineArray() {
    return <FormArray>this.modelForm.get('item_list');
  }

  clearModelData(){
    const control = <FormArray>this.modelForm.controls['item_list'];
    for(let i = control.length-1; i >= 0; i--) {
      control.removeAt(i)
    }
  }

  closeModal(){

  }

  showModal(){
    this.loadPoLines()
    this.scList$ = this.http.get(this.apiUrl + 'merchandising/loadPoSCList?id='+this.po_no).pipe( map( res => res['data']) )
  }

  loadPoLines(){
    //this.http.get(this.apiUrl + 'merchandising/loadPoLineData?id='+this.po_no).pipe( map( res => res['data']) )
      this.http.get(this.apiUrl + 'merchandising/loadPoLineData',{ params : {'id' : this.po_no }}).subscribe(data => {
        this.poData$ = data['data'];
        var count = Object.keys(this.poData$).length;

      })

  }



}






