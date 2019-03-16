import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map } from 'rxjs/operators';


import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgOption } from '@ng-select/ng-select';

import { AppFormValidator } from '../../../core/validation/app-form-validator';
import { BasicValidators } from '../../../core/validation/basic-validators';
import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';

declare var $: any;


@Component({
  selector: 'app-bulk',
  templateUrl: './bulk.component.html',
  styleUrls: ['./bulk.component.css']
})
export class BulkComponent implements OnInit {

  formHeaderGroup: FormGroup

  appValidator: AppFormValidator

  readonly apiUrl = AppConfig.apiUrl()
  saveStatus = 'SAVE'
  url = this.apiUrl + 'merchandising/bulk-costing'

  seasonList$: Observable<Array<any>>
  colorTypes$: Observable<Array<any>>
  style$: Observable<Array<any>>;//use to load style list in ng-select
  styleLoading = false;
  styleInput$ = new Subject<string>();



  constructor(private fb: FormBuilder, private http: HttpClient) { }

  ngOnInit() {

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class


    this.formHeaderGroup = this.fb.group({
      style_id: null,
      style_remark: null,
      last_revised_date: null,
      total_order_qty: null,
      division_name: null,
      division_id: null,
      style_desc: null,
      consumption_received_date: [null, [Validators.required]],
      pcd: null,
      country: null,
      bom_stage_id: null,
      costed_smv_id: null,
      total_cost: null,
      season_id: [null, [Validators.required]],
      delivery: null,
      color_type: null,
      fob: null,
      cust_name: null,
      cust_id: null,
      created_date: null,
      color_id: null,
      cost_per_min: null,
      cost_per_std_min: null,
      epm: null,
      np_margin: null,
      smv_received: null,
      plan_efficiency: [null, [Validators.required]],
      bulk_costing_id: null
      //category_name: [null, [Validators.required]],
      //items: this.fb.array([])
    });

    this.loadStyle()

    this.appValidator = new AppFormValidator(this.formHeaderGroup, []);

    /* this.formHeaderGroup.valueChanges.subscribe(data => { //validate form when form value changes
       this.appValidator.validate();
     })*/

    this.seasonList$ = this.getSeasonList()
    this.colorTypes$ = this.getColorOption();

  }

  formValidate() { //validate the form on input blur event
    this.appValidator.validate();
  }

  loadStyle() {
    this.style$ = this.styleInput$
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => this.styleLoading = true),
        switchMap(term => this.http.get<any[]>(this.url + '?type=auto', { params: { search: term } })
          .pipe(
            //catchError(() => of([])), // empty list on error
            tap(() => this.styleLoading = false)
          ))
      );
  }

  getSeasonList(): Observable<Array<any>> {
    return this.http.get<any[]>(this.url + '?type=getSeasonList')
      .pipe(map(res => res))
  }

  getColorOption(): Observable<Array<any>> {
    return this.http.get<any[]>(this.url + '?type=getColorType')
      .pipe(map(res => res))
  }

  loadStyleData() {
    //console.log(this.formHeaderGroup.get('style_id').value);

    let getStyleData$ = null;
    if (this.formHeaderGroup.get('style_id').value) {
      getStyleData$ = this.http.get(this.url + '?type=getStyleData&style_id=' + this.formHeaderGroup.get('style_id').value.style_id)
      getStyleData$.subscribe(
        (data) => {

          console.log(data)
          this.formHeaderGroup.patchValue({
            style_remark: data.style_remark,
            style_desc: data.style_desc,
            cust_name: data.cust_name,
            cust_id: data.cust_id,
            division_name: data.division_name,
            division_id: data.division_id,
            country: data.country,
            bom_stage_id: data.stage,
            delivery: 'Pending',

          })

        })
    } else {

      this.formHeaderGroup.reset();
      /*this.formHeaderGroup.patchValue({
        style_remark: ''
      })*/
    }
  }

  saveHeader() {

    /*if(!this.appValidator.validate())//if validation faild return from the function
        return;
    

    if (this.formHeaderGroup.valid) {
      console.log("Form Submitted!");
      console.log(this.formHeaderGroup.value);
      this.formHeaderGroup.reset();
    }*/

    if (!this.appValidator.validate())//if validation faild return from the function
      return;


    let formData = this.formHeaderGroup.getRawValue()
    formData['style_id'] = formData['style_id']['style_id']
    formData['season_id'] = formData['season_id']['season_id']
    formData['color_type'] = formData['color_type']['col_opt_id']
    formData['consumption_received_date'] = this.formatDate( formData['consumption_received_date'])
    formData['pcd'] = this.formatDate( formData['pcd'])
    formData['smv_received'] = this.formatDate( formData['smv_received'])
    formData['fob'] = this.formatDate( formData['fob'])

    let saveOrUpdate$ = null;

    console.log(formData);
    //let bulkCostingId = this.formHeaderGroup.get('bulk_costing_id').value
    //if (this.saveStatus == 'SAVE') {
    saveOrUpdate$ = this.http.post(this.url, formData)
    //}
    /*else if (this.saveStatus == 'UPDATE') {
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/companies/' + bulkCostingId, formData)
    }*/

    saveOrUpdate$.subscribe(
      (res) => {
        setTimeout(() => {
          // this.processing = false
          AppAlert.showSuccess({ text: res.data.message })
          this.formHeaderGroup.reset();
          //this.reloadTable()
        }, 2000)

      },
      (error) => {
        console.log(error)
      }
    );

  }


  formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

}
