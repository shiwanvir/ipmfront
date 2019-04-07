import { Component, OnInit,ViewChild,AfterViewInit} from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;


import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';
//service to commiunicate between two tabs
import { MeterialTranferService } from '.././meterial-transfer.service';

@Component({
  selector: 'app-meterial-transfer-in-list',
  templateUrl: './meterial-transfer-in-list.component.html',
  styleUrls: ['./meterial-transfer-in-list.component.css']
})
export class MeterialTransferInListComponent implements OnInit {

  datatable:any=null
  readonly apiUrl = AppConfig.apiUrl()

  constructor(private http:HttpClient ,private materialTransferService:MeterialTranferService ) { }

  ngOnInit() {

    this.createTable()

    this.materialTransferService.status.subscribe(status=>{
      if(status=='RELOAD_TABLE'){
          this.reloadTable()

      }

    })

  }

  createTable() { //initialize datatable
      console.log("im heree")
     this.datatable = $('#gatepassTable_tbl').DataTable({
       autoWidth: false,
       scrollY: "500px",
       scrollCollapse: true,
       processing: true,
       serverSide: true,
       ajax: {
            //headers : {Authorization: `Bearer ${this.authService.getToken()}`},
            dataType : 'JSON',
            "url": this.apiUrl + "stores/material-transfer?type=datatable"
        },
        columns: [
          
           {
             data: "status",
             orderable: false,
             render : function(data){
               if(data == "plan"){
                   return '<span class="label label-success">Plan</span>';
               }
               else{
                 return '<span class="label label-default">Inactive</span>';
               }
             }
          },
          { data: "gate_pass_no" },
          { data: "loc_receiver" },
          { data: "loc_transfer" },
          { data: "updated_date" }
       ],
     });

     //listen to the click event of edit and delete buttons
     $('#gatepassTable_tbl').on('click','i',e => {
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
        this.materialTransferService.changeData(data)
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
