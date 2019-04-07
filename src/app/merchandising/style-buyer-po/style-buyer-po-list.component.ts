import { Component, OnInit } from '@angular/core';

import { AppConfig } from '../../core/app-config';
import { BuyerPoService } from './buyer-po.service';

declare var $:any;

@Component({
  selector: 'app-style-buyer-po-list',
  templateUrl: './style-buyer-po-list.component.html',
  styleUrls: []
})
export class StyleBuyerPoListComponent implements OnInit {

  datatable : any = null
  queryData = []
  readonly apiUrl:string = AppConfig.apiUrl()
  searchingFieldsUrl = 'merchandising/customer-orders?type=search_fields';

  constructor(private buyerPoService : BuyerPoService) { }

  ngOnInit() {

    this.createTable()

  }

  createTable() { //initialize datatable
     this.datatable = $('#buyer_po_list').DataTable({
     autoWidth: false,
     scrollY: "500px",
     scrollX: true,
     scrollCollapse: true,
     processing: true,
     serverSide: true,
     fixedColumns:   {
       leftColumns: 2
     },
     ajax: {
          dataType : 'JSON',
          "url": this.apiUrl + "merchandising/customer-orders?type=datatable",
          data : {
            'query_data' : () => {return JSON.stringify(this.queryData);}
          }
      },
       columns: [
            {
              data: "order_id",
              width: '2%',
              render : function(data,arg,full){
                var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
                return str;
             }
           },
           {
             data: "order_status",
             render : function(data , arg , full){
               return '<span class="label" style="background-color:'+full['color']+'">'+data+'</span>';
             }
          },
          { data: "order_code" },
          { data: "order_company" },
          { data: "style_no" },
          { data: "customer_name" },
          { data: "division_description" },
          { data: "order_type_name" }
       ],
       columnDefs: [{
         orderable: false,
         width: '100px',
         targets: [ 0 ]
       }],

     });

     //listen to the click event of edit and delete buttons
     $('#buyer_po_list').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
          this.edit(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value']);
        }
     });
  }

  edit(data){
    this.buyerPoService.changeData(data)
  }


  delete(data) {

  }


  search(emittedData){
    console.log(emittedData)
    this.queryData = emittedData
    this.datatable.search("").draw();
  /*  this.http.post(this.apiUrl + 'app/search', {fields : queryData})
    .subscribe(
      data => {
        console.log(data)
      }
    )*/
  }

}
