import { Component, OnInit, TemplateRef, ViewChild, Input, ElementRef, NgModule  } from '@angular/core';
import {FormBuilder, FormGroup, FormControl, Validators, FormArray} from '@angular/forms';
//import { ModalDirective, BsModalService  } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../../core/app-config';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { CombineSoModal } from "./combine-so-modal/combine-so-modal.component";
import { NgOption } from '@ng-select/ng-select';

@Component({
  selector: 'app-combine-so',
  templateUrl: './combine-so.component.html'
 })
export class CombineSo implements OnInit {
  @ViewChild(CombineSoModal) combineModel: CombineSoModal;
  //@ViewChild(ModalDirective) combModel: ModalDirective;
  @ViewChild('combModel') public combModel:ModalDirective;

  styleList$:Observable<Array<any>>
  apiUrl = AppConfig.apiUrl()
  //modalRef: BsModalRef;

  combGroup : FormGroup
  constructor( private fb:FormBuilder, private http:HttpClient) { }

  ngOnInit() {

     this.combGroup = new FormGroup({
       customer: new FormControl(),
       division: new FormControl(),
       style: new FormControl(),
       costings: this.fb.array([])
     })

    this.styleList$ = this.getStyleList()

  }

  @Input() title:string;

  show(){

    this.combModel.show();
  }
  hide(){
    this.combModel.hide();
  }

  loadCostings(e){

    this.clearData()

    if(e.style_id){
      var style = e.style_id;
    }else{
      var style = e;
    }

    this.combineModel.modalFormGroup.controls['style'].setValue(style);
    this.http.get(this.apiUrl + 'merchandising/so-combine?style_id='+style+'&fields=bulk_costing_id&type=getCostingsForCombine').subscribe( res => {
      var count = Object.keys(res['data']).length;
      for (var i = 0; i < count; i++) {

        const controll = new FormGroup({
          'bulk_costing_id': new FormControl(res['data'][i]['bulkheader_id']),
          'so_no': new FormControl(res['data'][i]['details_id']),
          'style_no': new FormControl(res['data'][i]['style_no']),
          'costing_type': new FormControl(res['data'][i]['bom_stage_description'])
        });

        (<FormArray>this.combGroup.get('costings')).push(controll);
      }

    })



  }

  getStyleList(): Observable<Array<any>>{
    return this.http.get(this.apiUrl + 'merchandising/style?status=1&fields=style_id,style_no&type=select', ).pipe( map( res => res['data']) )
  }

  openModal(template: TemplateRef<any>) {
    this.combineModel.initModalGroup(1)
    this.combModel.show()
  }

  showModal(){
    this.combineModel.initModalGroup(1)
  }

  setCostingId(costingId){
    this.combineModel.modalFormGroup.controls['costing_id'].setValue(costingId);
  }

  closeCombModal(e){
    this.combModel.hide()
    this.loadCostings(this.combGroup.get('style').value['style_id'])
  }

  clearData(){
    const control = <FormArray>this.combGroup.controls['costings'];
    for(let i = control.length-1; i >= 0; i--) {
      control.removeAt(i)
    }
  }


}
