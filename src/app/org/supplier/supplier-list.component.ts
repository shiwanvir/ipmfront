import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

//third part components
declare var $:any;

import { AppConfig } from '../../core/app-config';
import { SupplierService } from './supplier.service';
import { AppAlert } from '../../core/class/app-alert';

@Component({
  selector: 'app-supplier-list',
  templateUrl: './supplier-list.component.html',
  styleUrls: []
})
export class SupplierListComponent implements OnInit {

  datatable:any = null
  readonly apiUrl = AppConfig.apiUrl()

  constructor(private http:HttpClient , private supplierService:SupplierService) { }

  ngOnInit() {

    this.createTable()

    this.supplierService.status.subscribe(status => {
      if(status == 'RELOAD_TABLE'){
        this.reloadTable()
      }
    })

  }


  createTable() { //initialize datatable
     this.datatable = $('#supplier_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       ajax: {
            //headers : {Authorization: `Bearer ${this.authService.getToken()}`},
            dataType : 'JSON',
            "url": this.apiUrl + "org/suppliers?type=datatable"
        },
        columns: [
            {
              data: "supplier_id",
              orderable: false,
              width: '3%',
              render : function(data,arg,full){
                var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
                return str;
             }
           },
           {
             data: "status",
             orderable: false,
             render : function(data){
               if(data == 1){
                   return '<span class="label label-success">Active</span>';
               }
               else{
                 return '<span class="label label-default">Inactive</span>';
               }
             }
          },
          { data: "supplier_code" },
          { data: "supplier_name" },
          { data: "supplier_short_name" },
          { data: "type_of_service" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#supplier_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
            this.edit(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value']);
        }
     });
  }

  reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
  }

  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'org/suppliers/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
      if(data['status'] == '1'){
        this.supplierService.changeData(data)
      }
    })
  }


  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected supplier?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'org/suppliers/' + id)
        .subscribe(data => {
            this.reloadTable()
        })
      }
    })
  }

}
