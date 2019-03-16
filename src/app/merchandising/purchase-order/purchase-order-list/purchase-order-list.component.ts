import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';

import { AppConfig } from '../../../core/app-config';
import { PoService } from '../po.service';

declare var $:any;

@Component({
  selector: 'app-purchase-order-list',
  templateUrl: './purchase-order-list.component.html',
  styleUrls: ['./purchase-order-list.component.css']
})
export class PurchaseOrderListComponent implements OnInit {

  datatable : any = null
  datatable2 : any = null
  readonly apiUrl:string = AppConfig.apiUrl()
  formlist : FormGroup

  constructor(private PoService : PoService, private fb:FormBuilder) { }

  ngOnInit() {

    this.formlist = this.fb.group({
      filter_type : null
    })


  }

  change_filter_type(){
      let ftype = this.formlist.get('filter_type').value
      if(ftype == 'General'){
        document.getElementById("list_table_01").style.display = "block";
        document.getElementById("list_table_02").style.display = "none";

        this.reloadTable2()
        this.createTable()
      }else{
        document.getElementById("list_table_02").style.display = "block";
        document.getElementById("list_table_01").style.display = "none";
        this.reloadTable()
        this.createTable2()
      }

  }

  reloadTable() {//reload datatable
      var table = $('#po_list').DataTable();
      table.destroy();
  }
  createTable() { //initialize datatable
     this.datatable = $('#po_list').DataTable({
     autoWidth: false,
     scrollY: "500px",
     scrollX: true,
     scrollCollapse: true,
     processing: true,
     serverSide: true,

     ajax: {
          dataType : 'JSON',
          "url": this.apiUrl + "merchandising/po-general?type=datatable"
      },
       columns: [
            {
              data: "po_id",
              render : function(data,arg,full){
                var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
                return str;
             }
           },
           {
             data: "po_status",
             render : function(data){
               if(data == 'PLANNED')
                 return '<span class="label label-warning">PLANNED</span>';
               else if(data == 'PENDING')
                 return '<span class="label label-danger">PENDING</span>';
               else if(data == 'RELEASED')
                 return '<span class="label label-success">RELEASED</span>';
             //  else
             //    return '<span class="label label-success">Active</span>';
             }
          },

          { data: "po_number" },
          { data: "po_type" },
          { data: "loc_name" },
          { data: "supplier_name" },
          { data: "currency_code" },
          { data: "currency_code" }

       ],
       columnDefs: [{
         orderable: false,
         width: '100px',
         targets: [ 0 ]
       }],

     });

     //listen to the click event of edit and delete buttons
     $('#po_list').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
          this.edit(att['data-id']['value']);
          //alert('ddd')
        }
        else if(att['data-action']['value'] === 'DELETE'){
          //  this.delete(att['data-id']['value']);
        }
     });
  }

  reloadTable2() {//reload datatable
    var table2 = $('#po_list2').DataTable();
    table2.destroy();
  }
  createTable2() { //initialize datatable
     this.datatable2 = $('#po_list2').DataTable({
     autoWidth: false,
     scrollY: "500px",
     scrollX: true,
     scrollCollapse: true,
     processing: true,
     serverSide: true,

     ajax: {
          dataType : 'JSON',
          "url": this.apiUrl + "merchandising/po-manual?type=datatable"
      },
       columns: [
            {
              data: "po_id",
              render : function(data,arg,full){
                var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT2" data-id="'+data+'"></i>';
                str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE2" data-id="'+data+'"></i>';
                return str;
             }
           },
           {
             data: "po_status",
             render : function(data){
               if(data == 'PLANNED')
                 return '<span class="label label-warning">PLANNED</span>';
               else if(data == 'PENDING')
                 return '<span class="label label-danger">PENDING</span>';
               else if(data == 'RELEASED')
                 return '<span class="label label-success">RELEASED</span>';
             //  else
             //    return '<span class="label label-success">Active</span>';
             }
          },

          { data: "po_number" },
          { data: "po_type" },
          { data: "loc_name" },
          { data: "supplier_name" },
          { data: "currency_code" },
          { data: "order_type" }

       ],
       columnDefs: [{
         orderable: false,
         width: '100px',
         targets: [ 0 ]
       }],

     });

     //listen to the click event of edit and delete buttons
     $('#po_list2').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT2'){
          this.edit2(att['data-id']['value']);
          //alert('ddd')
        }
        else if(att['data-action']['value'] === 'DELETE2'){
          //  this.delete2(att['data-id']['value']);
        }
     });
  }

  edit(data){
    this.PoService.changeData(data)
    //alert(data)
  }

  edit2(data){
    this.PoService.changeData2(data)
  //  alert(data)
  }

}
