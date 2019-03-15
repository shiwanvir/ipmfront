import { Component, OnInit,ViewChild,ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map } from 'rxjs/operators';
import { AppConfig } from '../../../core/app-config';
import { Items } from '../../models/Item.model';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import {SnotifyService , SnotifyPosition} from 'ng-snotify';


@Component({
  selector: 'app-bulk-details',
  templateUrl: './bulk-details.component.html',
  styleUrls: ['./bulk-details.component.css'],
  host: {
    '(document:keypress)': 'handleKeyboardEvent($event)'
  }
})
export class BulkDetailsComponent implements OnInit {

  @ViewChild('mainScreen') elementView: ElementRef;
  viewHeight: number=0;


  Supplier: string[] ;
  pOptions: string[] ;
  actionCount:number=0;
  htmlToAdd: string='';
  empty: any[] = [];

  category:any[] = [];
  total:number=0;
  netProfit:number=0.00;
  cpmfront_end:number=0;

  hotOptions: any
  dataset: any = [];
  instance: string = 'hot';

  form: FormGroup;
  formHeaderGroup: FormGroup;
  readonly apiUrl = AppConfig.apiUrl()
  url = this.apiUrl + 'merchandising/bulk'

  item$: Observable<Array<any>>;//use to load style list in ng-select
  itemLoading = false;
  itemInput$ = new Subject<string>();
  selecteditem:Items;




  style_code: string = '';
  main_component: string = '';
  main_color: string = '';
  main_smv: number = 0;
  comp_smv: number = 0;
  finance_cost: number = 0;
  cmp: number = 0;
  fob: number = 0;
  costOfAll: number = 0;
  tosterConfig = { timeout: 2000, showProgressBar: false, closeOnClick: false , position: SnotifyPosition.rightTop,}
  constructor(private fb:FormBuilder , private http:HttpClient, private route: ActivatedRoute, private hotRegisterer: HotTableRegisterer, private snotifyService: SnotifyService) {
    this.form = this.fb.group({
      bulk_info: this.fb.array([])
    });
  }



  ngOnInit() {
    document.body.classList.toggle('sidebar-main-hidden')
    this.formHeaderGroup = this.fb.group({
      ItemList:[],
      serialblk:this.route.snapshot.queryParamMap.get('serialblk'),
      info: this.fb.array([])
    });

    this.initializeTable();
    this.loadItem();

     // this.loadStyle();

    // this.dataChanged();

    this.viewHeight = this.elementView.nativeElement.offsetHeight;
  }

  initializeTable(){
    this.hotOptions = {
      columns: [
        {
          title : 'Item Type',
          type: 'autocomplete',
          source: function (query, process) {
            var url=$('#url').val();
            $.ajax({
              url: url + '?type=getMainCategory' ,
              dataType: 'json',
              data: {
                query: query
              },
              success: function (response) {
                process(response);

              }
            });
          },
          strict: true,
          data: 'main_item_type',
          readOnly: false
        },
        { type: 'text', title : 'Article No' , data: 'article_no',readOnly: false},

        {
          type: 'dropdown',
          title : 'Item Description',
          source: [],
          data: 'main_item_description',
          readOnly: false
        },
        {
          title : 'Color Type',
          type: 'autocomplete',
          source: function (query, process) {
            var url=$('#url').val();
            $.ajax({
              url: url + '?type=getColorType' ,
              dataType: 'json',
              data: {
                query: query
              },
              success: function (response) {
                process(response);

              }
            });
          },
          strict: true,
          data: 'color_type',
          readOnly: false
        },
        {
          title : 'Color',
          type: 'autocomplete',
          source: function (query, process) {
            var url=$('#url').val();
            $.ajax({
              url: url + '?type=getColorForDivision' ,
              dataType: 'json',
              data: {
                query: query
              },
              success: function (response) {
                process(response);

              }
            });
          },
          strict: true,
          data: 'color',
          readOnly: false
        },
        { type: 'text', title : 'Net Consumption' , data: 'net_consumption',readOnly: false},
        { type: 'text', title : 'Wastage' , data: 'wastage',readOnly: false},
        { type: 'text', title : 'Gross Consumption' , data: 'gross_consumption',readOnly: false},

        { type: 'text', title : 'Position' , data: 'position',readOnly: false},
        { type: 'text', title : 'Measurement' , data: 'measurement',readOnly: false},
        {
          title : 'Process Options',
          type: 'autocomplete',
          source: function (query, process) {
            var url=$('#url').val();
            $.ajax({
              url: url + '?type=getProcessOptions',
              dataType: 'json',
              data: {
                query: query
              },
              success: function (response) {
                process(response);

              }
            });
          },
          strict: true,
          data: 'process_options',
          readOnly: false
        },{
          title : 'UOM',
          type: 'autocomplete',
          source: function (query, process) {
            var url=$('#url').val();
            $.ajax({
              url: url + '?type=getUmo',
              dataType: 'json',
              data: {
                query: query
              },
              success: function (response) {
                process(response);

              }
            });
          },
          strict: true,
          data: 'uom',
          readOnly: false
        }, { type: 'text', title : 'Unit Price' , data: 'unit_price',readOnly: false},

        { type: 'text', title : 'Freight Charges' , data: 'freight_charges',readOnly: false},
        { type: 'text', title : 'Finance Charges' , data: 'finance_charges',readOnly: false},
        { type: 'text', title : 'MOQ' , data: 'moq',readOnly: false},
        { type: 'text', title : 'Surcharge' , data: 'surcharge',readOnly: false},
        { type: 'text', title : 'Total Cost' , data: 'total_cost'},
        { type: 'text', title : 'Shipping Terms' , data: 'shipping_terms',readOnly: false},
        { type: 'text', title : 'Lead Time' , data: 'lead_time',readOnly: false},
        {
          title : 'Country Of Origin',
          type: 'autocomplete',
          source: function (query, process) {
            var url=$('#url').val();
            $.ajax({
              url: url + '?type=getContry' ,
              dataType: 'json',
              data: {
                query: query
              },
              success: function (response) {
                process(response);

              }
            });
          },
          strict: true,
          data: 'country_of_origin',
          readOnly: false
        },
        { data: 'calculate_by_deliverywise',
          title : 'Calculate By Delivery wise',
          type: 'checkbox',
          readOnly: false
        },
        { data: 'OrderType',
          title : 'Order Type',
          type: 'dropdown',
          source: ['size wise','color wise','both'],
          readOnly: false
        },
        {
          title : 'Supplier',
          type: 'autocomplete',
          source: function (query, process) {
            var url=$('#url').val();
            $.ajax({
              url: url + '?type=getSupplier',
              dataType: 'json',
              data: {
                query: query
              },
              success: function (response) {
                process(response);
              }
            });
          },
          strict: true,
          data: 'supplier',
          readOnly: false
        },
        { type: 'text', title : 'Comments' , data: 'comments',readOnly: false},
        { renderer: "html" , title : 'Save' , data:"success"},
        { renderer: "html" , title : 'Copy' , data:"primary"},
        { renderer: "html" , title : 'Delete' , data:"danger"}


      ],
      afterOnCellMouseDown: (event, coords, TD) => {
        const hotInstance = this.hotRegisterer.getInstance(this.instance);
        var title=hotInstance.getColHeader(TD.col);
        if(title =='Save'){
          const hotInstance = this.hotRegisterer.getInstance(this.instance);
          var dataAll;
          if( typeof this.dataset[0] === "undefined"){
            dataAll=this.dataset;
           }else{
            dataAll=this.dataset[TD.row];
          }
          // console.log(dataAll);
          this.http.post(this.url ,dataAll)
                .subscribe(data => {this.snotifyService.success('saved successfully', this.tosterConfig);
                  hotInstance.render();

              });


        }
        if(title =='Copy'){//console.log('aaa',this.dataset.item_id);
          if( typeof this.dataset[0] === "undefined"){

            // if(this.dataset.item_id !=0){
              const hotInstance = this.hotRegisterer.getInstance(this.instance);
              this.http.put(this.url + '/'+this.dataset.item_id,[])
                  .subscribe(data => {
                    this.dataset = data;
                    hotInstance.render();
                    this.snotifyService.info('success, Copped', this.tosterConfig)
                  });
            // }else{
            //   alert('Please save');
            // }
          }else{
            if(this.dataset[TD.row].item_id !=0){
              const hotInstance = this.hotRegisterer.getInstance(this.instance);
              this.http.put(this.url + '/'+this.dataset[TD.row].item_id,[])
                  .subscribe(data => {
                    this.dataset = data;
                    hotInstance.render();
                    this.snotifyService.info('success, Copped', this.tosterConfig)
                  });
            }else{
              alert('Please save');
            }
          }

        }
        if(title =='Delete'){
          // console.log(this.dataset[TD.row].blkHead);
          if(this.dataset[TD.row].item_id !=0){
            const hotInstance = this.hotRegisterer.getInstance(this.instance);
            this.http.delete(this.url + '/'+this.dataset[TD.row].item_id)
                .subscribe(data => {
                  this.dataset = data;
                  this.totalCost();
                  this.snotifyService.error('success, Deleted', this.tosterConfig)
                });
          }else{
            alert('Please save');
          }
        }


      },
      afterChange: (changes, source) => {
        if (source === 'loadData' || source === 'internal' || changes.length > 1 || source == null) {
          return;
        }

        const hotInstance = this.hotRegisterer.getInstance(this.instance);
        // console.log(this.dataset[source[0][0]])

if(source[0][1] =='main_item_type'){
  $.ajax({
    url: this.url + '?type=loadItemAccordingCategory' ,
    dataType: 'json',
    data: {
      query: source[0][3]
    },
    success: function (response) {
      hotInstance.setCellMeta(source[0][0],hotInstance.propToCol('main_item_description'),'source', response)
    }
  });
}

        if(source[0][1] =='unit_price'){
          var valDataSet;
          if( typeof this.dataset[0] === "undefined"){
            valDataSet=this.dataset;
          }else{
            valDataSet=this.dataset[source[0][0]];
          }
          hotInstance.setDataAtCell(source[0][0],hotInstance.propToCol('total_cost'),this.lineTotalCost(valDataSet));
          this.totalCost();
        }

        if(source[0][1] =='gross_consumption'){console.log(this.dataset);
          var valDataSet;
          if( typeof this.dataset[0] === "undefined"){
            valDataSet=this.dataset;
          }else{
            valDataSet=this.dataset[source[0][0]];
          }
          hotInstance.setDataAtCell(source[0][0],hotInstance.propToCol('total_cost'),this.lineTotalCost(valDataSet));
          this.totalCost();
        }

        if(source[0][1] =='freight_charges'){
          var valDataSet;
          if( typeof this.dataset[0] === "undefined"){
            valDataSet=this.dataset;
          }else{
            valDataSet=this.dataset[source[0][0]];
          }
          hotInstance.setDataAtCell(source[0][0],hotInstance.propToCol('total_cost'),this.lineTotalCost(valDataSet));

        }

        if(source[0][1] =='finance_charges'){
          var valDataSet;
          if( typeof this.dataset[0] === "undefined"){
            valDataSet=this.dataset;
          }else{
            valDataSet=this.dataset[source[0][0]];
          }
          hotInstance.setDataAtCell(source[0][0],hotInstance.propToCol('total_cost'),this.lineTotalCost(valDataSet));

        }


      },

      manualColumnResize: true,
      autoColumnSize : true,
      rowHeaders: true,
      // height: 150,
      // stretchH: 'all',
      // selectionMode: 'range',
      /*columnSorting: true,*/
      className: 'htCenter htMiddle',
      readOnly: true,
      // rowHeaders: true,
      colHeaders: true,
      // width: 1000,
      fixedColumnsLeft: 4,
      manualColumnMove: true,
      afterInit: function(){
        // this.loadMainData();
      }

    }
    this.loadMainData();
  }

  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.keyCode == 26 && event.ctrlKey) this.addItem();
  }

  lineTotalCost(array){

    return ((array.gross_consumption*array.unit_price)+parseFloat(array.freight_charges)+parseFloat(array.finance_charges));

  }

  totalCost(){
    this.category=[];
    let list: any[] = [];
    var cat='';
    var last_total=0;

    if( typeof this.dataset[0] === "undefined"){
      // let list: any[] = [];
      list['sum']= (parseFloat(this.dataset.unit_price)*parseFloat(this.dataset.gross_consumption));
      list['name']= this.dataset.main_item_type;
      last_total =list['sum'];
      this.category.push(list);
    }else{
      this.dataset.forEach(element => {
        if(cat != element.main_item_type){
          let list: any[] = [];
          list['sum']=0;
          this.dataset.forEach(subelement => {
            if(element.main_item_type == subelement.main_item_type){
              console.log(subelement.main_item_type);
              list['sum']+= parseFloat(subelement.unit_price)*parseFloat(subelement.gross_consumption);
            }

          });
          list['sum']=list['sum'];
          last_total +=list['sum'];
          list['name']= element.main_item_type;
          this.category.push(list);
        }
        cat = element.main_item_type;
      });

    }
    this.total=last_total;
    var finance=(this.total*this.finance_cost);
    var corporate =(this.main_smv*this.cpmfront_end);
    this.costOfAll=(this.total+this.cmp+finance+corporate);
    this.netProfit=((this.costOfAll-this.fob)/this.costOfAll)
console.log('name',this.netProfit)



console.log(this.category);

    console.log(list);
  }




  loadMainData(){
    this.http.get(this.url + '?type=loadMainData&serialblk='+this.formHeaderGroup.get('serialblk').value)
        .subscribe(data => {
          this.style_code=data['style'];
          this.main_component=data['component'];
          this.main_color=data['color'];
          this.main_smv=data['styleSmv'];
          this.comp_smv=data['styleSmvComp'];
          this.finance_cost=data['finance_cost'];
          this.cpmfront_end=data['cpmfront_end'];
          this.cmp=data['cpm'];
          this.fob=data['fob'];
          // this.category=data['category'];
          // this.total=data['total'];
        });
  }


  loadItem() {
    this.dataset = [];
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    this.http.get(this.url + '?type=loadItem&serialblk='+this.formHeaderGroup.get('serialblk').value)
        .pipe( map(data => data) )
        .subscribe(data => {
          this.dataset = data;
          this.totalCost();
        });
  }





  addItem(){
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    this.http.get(this.url + '?type=addNewItem&serialblk='+this.formHeaderGroup.get('serialblk').value)
        .pipe( map(data => data) )
        .subscribe(data => {
          if(this.dataset.length==0){
            this.dataset=data;
          }else {
            this.dataset.push(data);
          };
          hotInstance.render()
        });
  }

  saveHeader(){
    
  }

}
