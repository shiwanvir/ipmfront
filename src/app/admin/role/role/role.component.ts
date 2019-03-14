import { Component, OnInit } from '@angular/core';

import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable , Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { AppFormValidator } from '../../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../../core/validation/primary-validators';
import { AppConfig } from '../../../core/app-config';
import { AppAlert } from '../../../core/class/app-alert';
import { RoleService } from '../role.service';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {

  formGroup : FormGroup
  apiUrl = AppConfig.apiUrl()
  formValidator : AppFormValidator
  saveStatus = 'SAVE'
  processing : boolean = false

  categories$ : Observable<any>
  permissions$ : Observable<any>
  //categoryList = []
  //categoryPermissionList = []

  constructor(private fb:FormBuilder, private http:HttpClient, private roleService:RoleService) { }

  ngOnInit() {

    this.initializeForm()
    this.loadPermissions()

    this.roleService.role_data.subscribe(data => {
      if(data != null){
        this.formGroup.setValue(data)
        this.saveStatus = 'UPDATE'
        this.changeCategory(null)
      }
    })

  }


  initializeForm(){
    let remoteValidationConfig = { //configuration for location code remote validation
      url:this.apiUrl + 'admin/roles/validate?for=duplicate',
      //formFields : this.formFields,
      fieldCode : 'role_name',
      /*error : 'Group code already exists',*/
      data : {
        role_id : function(controls){ return controls['role_id']['value']}
      }
    }

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      role_id : 0,
      role_name : [null, [Validators.required, PrimaryValidators.noSpecialCharactor],[primaryValidator.remote(remoteValidationConfig)]]
    })
    this.formValidator = new AppFormValidator(this.formGroup, {});
  }


  newRole(){
    AppAlert.showConfirm({
      'text' : 'Do you want to clear unsaved data?'
    },
    (result) => {
      if (result.value) {
        this.formGroup.reset()
      }
    })
  }


  save(){
    if(!this.formValidator.validate())//if validation faild return from the function
      return;
    this.processing = true
    AppAlert.showMessage('Processing...','Please wait while saving details')
    let saveOrUpdate$ = null;
    let roleId = this.formGroup.get('role_id').value
    if(this.saveStatus == 'SAVE'){
      saveOrUpdate$ = this.http.post(this.apiUrl + 'admin/roles', this.formGroup.getRawValue())
    }
    else if(this.saveStatus == 'UPDATE'){
      saveOrUpdate$ = this.http.put(this.apiUrl + 'admin/roles/' + roleId , this.formGroup.getRawValue())
    }

    saveOrUpdate$.
    pipe( map(res => res['data'] )).
    subscribe(
      (data) => {
        this.processing = false
        //this.formGroup.reset();
        this.formGroup.setValue({
          role_id : data.role.role_id,
          role_name : data.role.role_name
        })
        setTimeout(() => {
          AppAlert.closeAlert()
          AppAlert.showSuccess({text : data.message })
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


  changeCategory(code){
    /*this.categoryPermissionList = this.categoryList[cat]['permissions']
    console.log(this.categoryPermissionList)*/
    this.permissions$ = this.http.get(this.apiUrl + 'admin/roles?type=category_permissions&category=' + code + '&role=' + this.formGroup.get('role_id').value)
    .pipe( map(res => res['data']) )
  }


  changePermission(ele, code){
    let form_data = {
      'role_id' : this.formGroup.get('role_id').value,
      'permission' : code,
      'status' : ele.target.checked
    }
    this.http.post(this.apiUrl + 'admin/roles/change-role-permission', form_data)
    .pipe( map(res => res['data']) )
    .subscribe(
      data => {
        alert(data.message)
      },
      err => {

      }
    )
  }


  loadPermissions(){
    this.categories$ = this.http.get(this.apiUrl + 'admin/permission-categories?type=all')
    .pipe(
      map(res => res['data']),
      tap( res => {
        /*for(let x = 0 ; x < res.length ; x++){
          this.categoryList[res[x]['code']] = res[x]
        }*/
      })
     )
    /*.subscribe(data => {

    })*/
  }

}
