import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';
import { RoleService } from '../role.service';

declare var $:any;

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.css']
})
export class RoleListComponent implements OnInit {

  datatable : any = null
  readonly apiUrl:string = AppConfig.apiUrl()

  constructor(private roleService:RoleService, private http:HttpClient) { }

  ngOnInit() {

    this.createTable()

  }


  createTable() { //initialize datatable
     this.datatable = $('#role_list').DataTable({
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
          "url": this.apiUrl + "admin/roles?type=datatable"
      },
       columns: [
            {
              data: "role_id",
              render : function(data,arg,full){
                var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'" data-name="'+full['role_name']+'"></i>';
                str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
                return str;
             }
           },
           {
             data: "status",
             render : function(data , arg , full){
               if(data == 1){
                   return '<span class="label label-success">Active</span>';
               }
               else{
                 return '<span class="label label-default">Inactive</span>';
               }
             }
          },
          { data: "role_id" },
          { data: "role_name" }
       ],
       columnDefs: [{
         orderable: false,
         width: '100px',
         targets: [ 0 ]
       }],

     });

     //listen to the click event of edit and delete buttons
     $('#role_list').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
          this.edit(att['data-id']['value'], att['data-name']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
            this.delete(att['data-id']['value']);
        }
     });
  }

  reloadTable() {//reload datatable
      this.datatable.ajax.reload(null, false);
  }

  edit(role_id, role_name){
    this.roleService.changeData({
      role_id : role_id,
      role_name : role_name
    })
  }


  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected role?'
    },
    (result) => {
      if (result.value) {
        this.http.delete(this.apiUrl + 'admin/roles/' + id)
        .subscribe(
            (data) => {
                this.reloadTable()
            },
            (error) => {
              console.log(error)
            }
        )
      }
    })
  }

}
