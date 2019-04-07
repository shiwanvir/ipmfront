import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { AppConfig } from '../../core/app-config';
import { HttpClient } from '@angular/common/http';
declare var $:any;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  serverUrl:string = AppConfig.apiServerUrl()
  datatable:any = null
  saveStatus = 'SAVE'
  apiUrl = AppConfig.apiUrl()

  constructor(private router: Router, private http:HttpClient) { }

  redirectRegister() {
    this.router.navigate(['admin/user/']);
  }

  ngOnInit() {
    this.createTable() //load data list
  }

  createTable() { //initialize datatable
    this.datatable = $('#user-tbl').DataTable({
      autoWidth: false,
      scrollY: "500px",
      scrollCollapse: true,
      processing: true,
      serverSide: true,
      ajax: {
        dataType : 'JSON',
        "url": this.apiUrl + "admin/users?type=datatable"
      },
      columns: [
        {
          data: "user_id",
          orderable: false,
          width: '3%',
          render : function(data,arg,full){
            var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
            str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
            return str;
          }
        },

        { data: "first_name" },
        { data: "last_name" },
        { data: "emp_number" },
        { data: "email" },
        { data: "loc_name" },
        { data: "dep_name" },
        { data: "desig_id" }
      ],
    });

    //listen to the click event of edit and delete buttons
    $('#user-tbl').on('click','i',e => {
      let att = e.target.attributes;
      if(att['data-action']['value'] === 'EDIT'){
        this.edit(att['data-id']['value']);
      }
      else if(att['data-action']['value'] === 'DELETE'){
       // this.delete(att['data-id']['value']);
      }
    });
  }

  //submit data for edit
  edit(id) {
    this.router.navigate(['admin/user/', id]);
  }

  reloadTable() {//reload datatable
    this.datatable.ajax.reload(null, false);
  }

}
