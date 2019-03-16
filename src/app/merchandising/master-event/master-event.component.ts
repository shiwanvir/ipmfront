import { Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

// import { AppValidator } from '../../core/validation/app-validator';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

@Component({
  selector: 'app-master-event',
  templateUrl: './master-event.component.html',
  styleUrls: ['./master-event.component.css']
})
export class MasterEventComponent implements OnInit {

  @ViewChild(ModalDirective) sectionModel: ModalDirective;

  formGroup : FormGroup
  modelTitle : string = "New Action"
  // appValidator : AppValidator
  datatable:any = null
  saveStatus = 'SAVE'

  //to manage form error messages
  formFields = {
    action_name : '',
    action_description : ''
  }
  apiUrl = AppConfig.apiUrl();
  constructor(private fb:FormBuilder , private http:HttpClient) { }



  ngOnInit() {

    // this.formGroup = this.fb.group({
    //   action_id : 0,
    //   action_name : [null , [Validators.required]],
    //   action_description : [null , [Validators.required]]
    // })

    this.createTable() //load data list
  }

  createTable() { //initialize datatable
    this.datatable = $('#season_tbl').DataTable({
      autoWidth: false,
      scrollY: "500px",
      scrollCollapse: true,
      processing: true,
      serverSide: true,
      ajax: {
        dataType : 'JSON',
        "url": this.apiUrl + "merchandising/tna-master?type=datatable"
      },
      columns: [
        {
          data: "action_id",
          orderable: false,
          width: '3%',
          render : function(data,arg,full){
            var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
            str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
            return str;
          }
        }, {
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
        { data: "action_name" },
        { data: "action_description" },
        { data: "offset" }
      ],

    });
    //listen to the click event of edit and delete buttons
    $('#season_tbl').on('click','i',e => {
      let att = e.target.attributes;
      if(att['data-action']['value'] === 'EDIT'){
        this.edit(att['data-id']['value']);
      }
      else if(att['data-action']['value'] === 'DELETE'){
        this.delete(att['data-id']['value']);
      }
    })

  }


  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + "merchandising/tna-master/" + id)
        .pipe(map( data => data['data'] ))
        .subscribe(data => {
          if(data['status'] == '1')
          {
            this.sectionModel.show()
            this.modelTitle = "Update Action"
            this.formGroup.setValue({
              'action_id' : data['action_id'],
              'action_name' : data['action_name'],
              'action_description' : data['action_description']
            })
            this.formGroup.get('action_name').disable()
            this.saveStatus = 'UPDATE'
          }
        })
  }

  delete(id) { //deactivate payment term
    AppAlert.showConfirm({
          'text' : 'Do you want to deactivate selected Action?'
        },
        (result) => {
          if (result.value) {
            this.http.delete(this.apiUrl + "merchandising/tna-master/" + id)
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
  reloadTable() {//reload datatable
    this.datatable.ajax.reload(null, false);
  }


  formValidate(){

  }

  //save and update action details
  saveAction(){
    //this.appValidation.validate();
    let saveOrUpdate$ = null;
    let sectionId = this.formGroup.get('action_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + "merchandising/tna-master", this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + "merchandising/tna-master/" + sectionId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
        (res) => {
          AppAlert.showSuccess({text : res.data.message })
          this.formGroup.reset();
          this.reloadTable()
          this.sectionModel.hide()
        },
        (error) => {
          console.log(error)
        }
    );
  }

  showEvent(event){ //show event of the bs model
    this.formGroup.get('action_name').enable()
    this.formGroup.reset();
    this.modelTitle = "New Action"
    this.saveStatus = "SAVE"
  }

}
