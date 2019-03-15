import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map } from 'rxjs/operators';
import { HotTableRegisterer } from '@handsontable/angular';
import * as Handsontable from 'handsontable';

import {SnotifyService , SnotifyPosition} from 'ng-snotify';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgOption } from '@ng-select/ng-select';

import { AppFormValidator } from '../../../core/validation/app-form-validator';
import { BasicValidators } from '../../../core/validation/basic-validators';
import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';
import { Style } from '../../models/style.model';
import { ColorTypes } from '../../models/ColorTypes.model';

declare var $: any;


@Component({
  selector: 'app-bulk',
  templateUrl: './bulk.component.html',
  styleUrls: ['./bulk.component.css']
})
export class BulkComponent implements OnInit {

  public show:boolean = false;
  color: any ;
   imgSrc = 'http://surface/assets/styleImage/dif.png';

  formHeaderGroup: FormGroup
  formGroup : FormGroup
  hotOptions: any
  dataset: any = [];
  instance: string = 'hot';

  appValidator: AppFormValidator

  readonly apiUrl = AppConfig.apiUrl()
  saveStatus = 'SAVE'
  url = this.apiUrl + 'merchandising/bulk-costing'

  popupHeaderTitle : string = "New Item"
  loading : boolean = false;
  loadingCount : number = 0
  processing : boolean = false

  seasonList$: Observable<Array<any>>

  colorTypes$: Observable<Array<any>>

  BomStage$: Observable<Array<any>>

  form: FormGroup;

  style$: Observable<Array<any>>;//use to load style list in ng-select
  styleLoading = false;
  styleInput$ = new Subject<string>();
  selectedstyle:Style;

  @ViewChild(ModalDirective) lineModel: ModalDirective;
  @ViewChild(ModalDirective) fgSfgModel: ModalDirective;
  tosterConfig = { timeout: 2000, showProgressBar: false, closeOnClick: false , position: SnotifyPosition.rightTop,}
  constructor(private fb:FormBuilder , private http:HttpClient, private hotRegisterer: HotTableRegisterer, private snotifyService: SnotifyService) {
    this.form = this.fb.group({
      bulk_info: this.fb.array([])
    });
  }

  ngOnInit() {

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formHeaderGroup = this.fb.group({
      Style: [],
      style_remark: null,
      last_revised_date: null,
      finance_charges: null,
      total_order_qty: null,
      division_name: null,
      division_id: null,
      style_desc: null,
      consumption_received_date: [null],
      pcd: null,
      country: null,
      bom_stage: [],
      costed_smv_id: null,
      total_cost: null,
      season_id: [],
      delivery: null,
      color_type: [],
      fob: null,
      cust_name: null,
      cust_id: null,
      created_date: null,
      color_id: [],
      cost_per_min: null,
      cost_per_std_min: null,
      epm: null,
      np_margin: null,
      smv_received: null,
      plan_efficiency: [null],
      bulk_costing_id: null,
      bulk_header:0,
      info: this.fb.array([])
    });

    this.initializeTable()
    this.loadStyle();

    this.appValidator = new AppFormValidator(this.formHeaderGroup, []);



  }

  formValidate() { //validate the form on input blur event
    this.appValidator.validate();
  }
  initializeTable(){
    this.hotOptions = {
      // hiddenColumns: {
      //   columns: [4],
      //   indicators: true
      // },
      columns: [
        { type: 'text', title : 'PACK' , data: 'pack_name'},
        { type: 'text', title : 'FEATURE' , data: 'main_featureName'},
        { type: 'text', title : 'COMPONENT' , data: 'description'},

        {
        title : 'COLOR',
          type: 'autocomplete',
          source: function (query, process) {
            var url=$('#url').val();
            var division_id=$('#division_id').val();
            // alert(this.url);
            $.ajax({
              //url: 'php/cars.php', // commented out because our website is hosted as a set of static pages
              url: url + '?type=getColorForDivision&division_id=' + division_id,
              dataType: 'json',
              data: {
                query: query
              },
              success: function (response) {
                console.log("response", response);
                //process(JSON.parse(response.data)); // JSON.parse takes string as a argument
                process(response);

              }
            });
          },
          strict: true,
          data: 'color',
        readOnly: false
        },
        { data: 'mcq',
          title : 'MCQ',
          type: 'checkbox',
          readOnly: false},
        { data: 'surcharge',
          title : 'SURCHARGE',
          type: 'checkbox',
          readOnly: false},
        { renderer: "html" , title : 'Save' , data:"success"},
        { renderer: "html" , title : 'Copy' , data:"primary"},
        { renderer: "html" , title : 'Open' , data:"danger"}
      ],
      afterOnCellMouseDown: (event, coords, TD) => {
        const hotInstance = this.hotRegisterer.getInstance(this.instance);
        var title=hotInstance.getColHeader(TD.col);
        if(title =='Save'){

          var headr= $('#bulk_header').val();
          var bom= this.formHeaderGroup.get('bom_stage').value.bom_stage_id;

          console.log(bom);
          if(typeof bom  !== "undefined"){
            this.http.post(this.url + '?type=lineHeader&hader='+headr+'&bom='+bom+'&col='+this.formHeaderGroup.get('color_type').value.col_opt_id+'&sea='+this.formHeaderGroup.get('season_id').value.season_id,this.dataset[TD.row])
                .subscribe(data => {
                  this.dataset=[];
                  this.dataset = data;
                  this.snotifyService.success('saved successfully', this.tosterConfig);
                });
          }else{
            alert('dd');
          }


        }

        if(title =='Copy'){
         if(this.dataset[TD.row]['blkHead'] !=0){
           // this.dataset=[];
           this.http.put(this.url + '/'+this.dataset[TD.row]['blkHead'],this.formHeaderGroup.get('Style').value)
               .subscribe(data => {
                  console.log(data);
                  if(data==0){
                    this.snotifyService.warning('Please Save All Info Given Pack', this.tosterConfig)
                  }else {
                    this.dataset=[];
                    this.dataset = data;
                  }

               });

         }

        }
        if(title =='Open'){
          console.log(this.dataset[TD.row]);
          if(this.dataset[TD.row].blkHead !=0){
            window.open(AppConfig.blkNewTabUrl()+'?serialblk='+this.dataset[TD.row].blkHead, "_blank");
          }else{
            alert('Please save');
          }

        }
        // if (event.realTarget.nodeName.toLowerCase() === 'button' ) {

          // this.click('afterOnCellMouseDown');
        // }
      },
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


  loadStyle() {

    this.style$ = concat(
        of([]), // default items
        this.styleInput$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.styleLoading = true),
            switchMap(term => this.http.get<Style[]>(this.url + '?type=auto', { params: { search: term } }).pipe(
                catchError(() => of([])), // empty list on error
                tap(() => this.styleLoading = false)
            ))
        )
    );
    this.seasonList$ = this.getSeasonList();
    this.colorTypes$ = this.getColorOption();
    this.BomStage$ = this.getBomStage();


  }

  getSeasonList(): Observable<Array<any>> {
    return this.http.get<any[]>(this.url + '?type=getSeasonList')
      .pipe(map(res => res))
  }

  getColorOption(): Observable<Array<any>> {
    return this.http.get<any[]>(this.url + '?type=getColorType')
      .pipe(map(res => res))
  }

  getBomStage(): Observable<Array<any>> {
    return this.http.get<any[]>(this.url + '?type=getBomStage')
        .pipe(map(res => res))
  }

  loadStyleData() {
    this.formHeaderGroup.patchValue({bulk_header:0})
  this.http.get(this.url + '?type=getStyleData&style_id=' + this.formHeaderGroup.get('Style').value.style_id)
        .subscribe(data => {
          this.imgSrc = "http://surface/assets/styleImage/"+data['image'];
          this.formHeaderGroup.patchValue({
            style_remark: data['style_remark'],
            last_revised_date:data['blk_hader']['updated_date'],
            finance_charges:data['blk_hader']['finance_charges'],
            total_order_qty: data['blk_hader']['total_order_qty'],
            division_name: data['division_name'],
            division_id: data['division_id'],
            style_desc:  data['style_desc'],
            // consumption_received_date: ['02/10/2019', [Validators.required]],
            // pcd: data['blk_hader']['pcd'],
            pcd: data['blk_hader']['pcd'],
            country: data['country'],
            bom_stage: data['bom_stage_id'],//bom stage
            costed_smv_id: '5.231',// smv
            total_cost: data['blk_hader']['total_cost'],
            // season_id: [data['blk_hader']['season_id']],
            delivery: 'Pending',
            color_type: data['blk_hader']['color_type_id'],
            // fob: data['blk_hader']['fob'],
            fob: data['blk_hader']['fob'],
            cust_name: data['cust_name'],
            cust_id: data['cust_id'],
            created_date: data['blk_hader']['created_date'],
            color_id: null,
            // cost_per_min: data['blk_hader']['cost_per_min'],
            cost_per_min: data['blk_hader']['cost_per_min'],
            // cost_per_std_min: data['blk_hader']['cost_per_std_min'],
            cost_per_std_min: data['blk_hader']['cost_per_std_min'],
            epm: data['blk_hader']['epm'],
            // np_margin: data['blk_hader']['np_margin'],
            np_margin: data['blk_hader']['np_margin'],
            smv_received: '03/01/2019',
            plan_efficiency: data['blk_hader']['plan_efficiency'],
            bulk_costing_id: null,
            bulk_header:data['blk_hader']['bulk_costing_id'],

          })




        });
  }

  public saveLineHeader(i){
    alert('sss');
    var headr= $('#bulk_header').val();
    this.http.post(this.url + '?type=lineHeader&h='+headr,this.form.value.bulk_info[i])
        .subscribe(data => {
          this.form.value.bulk_info[i]['action']=data;
          alert(data);
        });
    // console.log(this.form.value.bulk_info[0]);
  }

  openLine(i){

    var id=this.form.value.bulk_info[i]['action'];
    window.open(AppConfig.blkNewTabUrl()+'?serialblk='+id, "_blank")
  }


  saveHeader() {

    let formData = this.formHeaderGroup.getRawValue();
    let saveOrUpdate$ = null;
    saveOrUpdate$ = this.http.post(this.url, formData);

    saveOrUpdate$.subscribe(
      (res) => {
        setTimeout(() => {
          AppAlert.showSuccess({ text: res.data.message })
          // this.formHeaderGroup.reset();
          //this.reloadTable()
        }, 2000)

        $('#bulk_header').val(res.data.bulkCostin['bulk_costing_id'].toString());
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

  loadFinishGood() {
    console.log(this.formHeaderGroup.getRawValue());

    this.dataset = [];
    // let formData_new = this.formHeaderGroup.getRawValue();
    this.http.get(this.url + '?type=getFinishGood&style_id=' + this.formHeaderGroup.get('Style').value.style_id+'&blk='+this.formHeaderGroup.get('bulk_header').value+'&bom='+this.formHeaderGroup.get('bom_stage').value.bom_stage_id+'&col='+this.formHeaderGroup.get('color_type').value.col_opt_id+'&sea='+this.formHeaderGroup.get('season_id').value.season_id)
        .pipe( map(data => data) )
        .subscribe(data => {
          this.dataset = data;

        })

  }
}
