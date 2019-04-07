import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../../../core/app-config';
import {FormBuilder, FormGroup, FormControl, Validators, FormArray} from '@angular/forms';
import { Subject, Observable, of, concat } from 'rxjs';

@Component({
  selector: 'combine-so-modal',
  templateUrl: './combine-so-modal.component.html'
})
export class CombineSoModal implements OnInit {
  modalFormGroup : FormGroup
  apiUrl = AppConfig.apiUrl()
  @Output() modalEmt = new EventEmitter();

  costingId = null;

  styleList$:Observable<Array<any>>
  combGroup : FormGroup
  soList: FormArray;

  constructor(private fb:FormBuilder, private http:HttpClient) { }

  ngOnInit() {

    this.modalFormGroup = this.fb.group({
      style: '',
      qty: '',
      costing_id: '',
      soList: this.fb.array([ ])
    });

  }

  initModalGroup(costingId): void {
    this.clearModelData()

    this.http.get(this.apiUrl + 'merchandising/customer-orders?style_id=1&type=customer_orders_for_style').subscribe( res => {
      var count = Object.keys(res['data']).length;

      for (var i = 0; i < count; i++) {
        const controls = new FormGroup({
          'details_id': new FormControl(res['data'][i]['details_id']),
          'color': new FormControl(res['data'][i]['color_name']),
          'color_id': new FormControl(res['data'][i]['color_id']),
          'so_no': new FormControl(res['data'][i]['order_code']),
          'country': new FormControl(res['data'][i]['country_description']),
          'qty': new FormControl(res['data'][i]['order_qty']),
          'item_select':  new FormControl(true)
        });

        (<FormArray>this.modalFormGroup.get('soList')).push(controls);

      }
    })

  }

  combineSo(){
    var formData = this.modalFormGroup.value;

    this.http.post(this.apiUrl + 'merchandising/so-combine?styleId='+this.modalFormGroup.controls['costing_id'].value,formData)
        .subscribe(data => {
          var massage='';
          this.modalEmt.emit();
          this.clearModelData();
          //console.log(data);
        })
  }


  clearModelData(){
    const control = <FormArray>this.modalFormGroup.controls['soList'];
    for(let i = control.length-1; i >= 0; i--) {
      control.removeAt(i)
    }
  }


}
