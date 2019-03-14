import { Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

@Component({
  selector: 'app-cluster',
  templateUrl: './cluster.component.html',
  styleUrls: ['../../../styles/validation.css']
})
export class ClusterComponent implements OnInit {

  @ViewChild(ModalDirective) clusterModel: ModalDirective;

  formGroup : FormGroup
  popupHeaderTitle : string = "New Cluster"
  apiUrl = AppConfig.apiUrl()
  appFormValidator : AppFormValidator
  sourceList$:Observable<Array<any>>//observable to featch source list
  datatable : any = null
  saveStatus = 'SAVE'
  loading : boolean = false
  processing : boolean = false
  loadingCount : number = 0

  constructor(private fb:FormBuilder , private http:HttpClient) { }

  ngOnInit() {

    this.initializeForm()

  }


  initializeForm(){
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'org/clusters/validate?for=duplicate',
      //formFields : this.formFields,
      fieldCode : 'group_code',
      error : 'Group code already exists',
      data : {
        group_id : function(controls){ return controls['group_id']['value']}
      }
    }

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      group_id : 0,
      group_code : [null , [Validators.required, PrimaryValidators.noSpecialCharactor],[primaryValidator.remote(remoteValidationConfig)]],
      group_name : [null , [Validators.required, PrimaryValidators.noSpecialCharactor]],
      source_id : [null , [Validators.required]]
    })
    //create new validation object
    this.appFormValidator = new AppFormValidator(this.formGroup, {});
  }


  //load data for slect boxes when open the model
  async loadModelData(){
    this.loading = true
    this.loadingCount = 0
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while loading data')
    this.sourceList$ = this.getSourceList()
  }


  //chek all data were loaded, if loaded active save button
  checkLoadingStatus(){
    if(this.loadingCount >= 1){
      this.loading = false
      this.loadingCount = 0
      setTimeout(() => {
        AppAlert.closeAlert()
      } , 500)
    }
  }


  createTable() { //initialize datatable
     this.datatable = $('#cluster_tbl').DataTable({
     autoWidth: false,
     scrollY: "500px",
     scrollCollapse: true,
     processing: true,
     serverSide: true,
     ajax: {
          dataType : 'JSON',
          "url": this.apiUrl + "org/clusters?type=datatable"
      },
       columns: [
            {
              data: "group_id",
              render : function(data,arg,full){
                var str = '<i class="icon-pencil" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer;margin-right:3px" data-action="EDIT" data-id="'+data+'"></i>';
                str += '<i class="icon-bin" style="border-style:solid; border-width: 1px;padding:2px;cursor:pointer" data-action="DELETE" data-id="'+data+'"></i>';
                return str;
             }
           },
           {
             data: "status",
             render : function(data){
               if(data == 1){
                   return '<span class="label label-success">Active</span>';
               }
               else{
                 return '<span class="label label-default">Inactive</span>';
               }
             }
          },
          { data: "group_code" },
          { data: "group_name" },
          { data: "source_name" }
       ]
     });

     //listen to the click event of edit and delete buttons
     $('#cluster_tbl').on('click','i',e => {
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


  getSourceList():Observable<Array<any>>{
    return this.http.get<any[]>(this.apiUrl + 'org/sources?active=1&fields=source_id,source_name')
    .pipe(
      map( res => res['data']),
      tap( res => {
        this.loadingCount++
        this.checkLoadingStatus()
      })
    )
  }

  //save and update source details
  saveCluster(){
    if(!this.appFormValidator.validate())//if validation faild return from the function
      return;
    AppAlert.showMessage('Processing...','Please wait while saving details')
    let saveOrUpdate$ = null;
    let clusterId = this.formGroup.get('group_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'org/clusters', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'org/clusters/' + clusterId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.subscribe(
      (res) => {
        this.formGroup.reset();
        this.clusterModel.hide()
        this.reloadTable()
        setTimeout(() => {
          AppAlert.closeAlert()
          AppAlert.showSuccess({text : res.data.message })
        } , 500)
     },
     (error) => {
        this.processing = false
         AppAlert.closeAlert()
         AppAlert.showError({text : 'Process Error' })
         console.log(error)
     }
   );
  }

  edit(id) { //get payment term data and open the model
    this.http.get(this.apiUrl + 'org/clusters/' + id)
    .pipe(map( data => data['data'] ))
    .subscribe(data => {
      if(data['status'] == '1')
      {
        this.formGroup.get('group_code').disable()
        this.saveStatus = 'UPDATE'
        this.clusterModel.show()
        this.popupHeaderTitle = "Update Cluster"
        this.formGroup.setValue({
         'group_id' : data['group_id'],
         'group_code' : data['group_code'],
         'group_name' : data['group_name'],
         'source_id' : data['source_id']
        })

      }
    })
  }

  delete(id) { //deactivate payment
    AppAlert.showConfirm({
      'text' : 'Do you want to deactivate selected cluster?'
    },(result) => {
      if (result.value) {
        AppAlert.showMessage('Processing...','Please wait while deliting cluster')
        this.http.delete(this.apiUrl + 'org/clusters/' + id)
        .subscribe(
            (data) => {
                this.reloadTable()
                AppAlert.closeAlert()
            },
            (error) => {
              AppAlert.closeAlert()
              AppAlert.showError({ text : 'Process Error' })
              console.log(error)
            }
        )
      }
    })

  }

  showEvent(event){ //show event of the bs model
    this.formGroup.get('group_code').enable()
    this.formGroup.reset();
    this.popupHeaderTitle = "New Cluster"
    this.saveStatus = "SAVE"
    this.loadModelData()
  }

}
