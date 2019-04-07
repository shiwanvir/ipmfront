import { Component, OnInit,ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';
import {Router} from "@angular/router";
import {ActivatedRoute} from "@angular/router";

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

//models
import { Country } from '../../org/models/country.model';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  //modelTitle:string = "Register Users"
  //serverUrl:string = AppConfig.apiServerUrl().
  apiUrl = AppConfig.apiUrl()
  formValidator : AppFormValidator
  saveStatus = 'SAVE'
  formGroup:FormGroup
  userId = null
  selectedLocation = null

  location$ : Observable<Array<any>>
  department$ : Observable<Array<any>>
  designation$ : Observable<Array<any>>
  costCenter$ : Observable<Array<any>>
  user$ : Observable<Array<any>>

  notSelectedRoles$ : Observable<any>
  selectedRoles$ : Observable<any>
  notSelectedLocations$ : Observable<any>
  selectedLocations$ : Observable<any>

  loading = false
  //submitted = false;
  processing = false;

  //to manage form error messages
  /*formFields = {
    first_name : 'sdsds',
    last_name : '',
    date_of_birth : '',
    nic_no : ''
  }*/

  constructor(private router:Router, private fb:FormBuilder,private http:HttpClient, private route: ActivatedRoute) { }

  ngOnInit() {
    this.location$ = this.loadLocations()
    this.department$ = this.loadDepartments()
    this.designation$ = this.loadDesignations()
    this.costCenter$ = this.loadCostCenters()
    this.user$ = this.loadUsers()

    let remoteValidationConfig = { //configuration for location code remote validation
      //url:this.apiUrl + 'org/customers/validate?for=duplicate',
      //formFields : this.formFields,
      fieldCode : 'customer_code',
      data : {
        customer_id : function(controls){ return controls['customer_id']['value']}
      }
    }

    let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({
      user_id : 0 ,
      first_name : [null , [Validators.required,Validators.minLength(3)]],
      last_name : [null , [Validators.required]],
      date_of_birth : [null , [Validators.required]],
      nic_no : [null , [Validators.required]],
      gender : [null , [Validators.required]],
      civil_status : [null , [Validators.required]],
      mobile_no : null,
      email : [null, [Validators.email]],
      emp_number : [null , [Validators.required]],
      joined_date : [null , [Validators.required]] ,
      loc_id : [null , [Validators.required]],
      dept_id : [null , [Validators.required]],
      desig_id : [null , [Validators.required]],
      cost_center_id : [null , [Validators.required]],
      resign_date : null ,
      reporting_level_1 : null ,
      reporting_level_2 : null ,
      user_name : null,
      password: null
    })

    //create new validation object
    this.formValidator = new AppFormValidator(this.formGroup,{});

    /*this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })*/
    let userId = this.route.snapshot.paramMap.get('id')
    if(userId != null){
      this.saveStatus = 'UPDATE'
      this.formGroup.patchValue({'user_id': userId})
      this.getUser(this.route.snapshot.paramMap.get('id'));
    }

    this.loadSelectedLocations()
    this.loadNotSelectedLocations()


    this.http.get(this.apiUrl + 'app/menus')
    .subscribe(data => {
      console.log(data)
    })


  }

  private getUser(id){

    this.http.get(this.apiUrl + 'admin/users/' + id/*,{ params : {'type': 'edit','id' : id }}*/)
        .subscribe(data => {

          data = data['data']

          this.formGroup.setValue({
            'user_id': data['user_id'],
            'first_name' : data['first_name'],
            'last_name' : data['last_name'],
            'date_of_birth' : data['date_of_birth'],
            'gender' : data['gender'],
            'civil_status' : data['civil_status'],
            'mobile_no' :  data['mobile_no'],
            'email' :  data['email'],
            'emp_number' :  data['emp_number'],
            'joined_date' :  data['joined_date'],
            'nic_no' :  data['nic_no'],
            'loc_id':  data['loc_id'],
            'dept_id' :  data['dept_id'],
            'desig_id' : data['desig_id'],
            'cost_center_id' : data['cost_center_id'],
            'resign_date' : data['resign_date'],
            'reporting_level_1' : data['reporting_level_1'],
            'reporting_level_2' : data['reporting_level_2'],
            'user_name' : null,//data['user_name'],
            'password' : '123'
          })


          //this.formGroup.get('source_code').disable()
          //this.formGroup.setValue(data)
        })


    return true;
  }

  saveRegisterForm() {
    if(!this.formValidator.validate())//if validation faild return from the function
      return;
    this.processing = true;
    //this.userId = this.route.snapshot.paramMap.get('id')
    let formData = this.formGroup.getRawValue();
    let saveOrUpdate$ = null;
    //formData['currency'] = formData['currency']['currency_id']
    //formData['customer_country'] = formData['customer_country']['country_id']
    if(this.saveStatus == 'UPDATE'){ // Update
      saveOrUpdate$ = this.http.put(this.apiUrl + 'admin/users/'+this.userId  , formData)
    }
    else if(this.saveStatus == 'SAVE'){ // Insert
      //console.log('save');
      //let userId = this.formGroup.get('user_id').value
      saveOrUpdate$ = this.http.post(this.apiUrl + 'admin/users', formData)
    }

    saveOrUpdate$
    .pipe( map(res => res['data']) )
    .subscribe(
        (data) => {
          AppAlert.showSuccess({text : data.message })
          this.processing = false;
          this.formGroup.setValue({
            'user_id': data.user_profile.user_id,
            'first_name' : data.user_profile.first_name,
            'last_name' : data.user_profile.last_name,
            'date_of_birth' : data.user_profile.date_of_birth,
            'gender' : data.user_profile.gender,
            'civil_status' : data.user_profile.civil_status,
            'mobile_no' :  data.user_profile.mobile_no,
            'email' :  data.user_profile.email,
            'emp_number' :  data.user_profile.emp_number,
            'joined_date' :  data.user_profile.joined_date,
            'nic_no' :  data.user_profile.nic_no,
            'loc_id':  data.user_profile.loc_id,
            'dept_id' :  data.user_profile.dept_id,
            'desig_id' : data.user_profile.desig_id,
            'cost_center_id' : data.user_profile.cost_center_id,
            'resign_date' : data.user_profile.resign_date,
            'reporting_level_1' : data.user_profile.reporting_level_1,
            'reporting_level_2' : data.user_profile.reporting_level_2,
            'user_name' : (data.user.user_name == undefined) ? '' : data.user.user_name,
            'password' : ''
          })
          this.saveStatus = 'UPDATE'
          return false;
        },
        (error) => {
          AppAlert.showError({ text : 'Process Error' })
          this.processing = false;
          console.log(error)
        }
    )
  }




  saveRoles(data) {
    let submitData = {
      roles : data,
      user_id : this.formGroup.get('user_id').value,
      loc_id : this.selectedLocation
    }
    this.http.post(this.apiUrl + 'admin/users/roles', submitData).subscribe(
      data => {
        AppAlert.showSuccess({text : 'User roles were assigned successfully'})
      },
      error => { console.log(error) }
    )
  }


  saveLocations(data) {
    let submitData = {
      locations : data,
      user_id : this.formGroup.get('user_id').value
    }
    this.http.post(this.apiUrl + 'admin/users/locations', submitData).subscribe(
      data => {
        AppAlert.showSuccess({text : 'User locations were assigned successfully'})
        this.loadSelectedLocations()
      },
      error => { console.log(error) }
    )
  }




/*  formValidate(){ //validate the form on input blur event
    this.appValidator.validate();
  }*/

  // convenience getter for easy access to form fields
  get f() { return this.formGroup.controls; }


  newUser(){
      AppAlert.showConfirm({
        'text' : 'Do you want to clear all unsaved data?'
      },(result) => {
        if (result.value) {
          this.saveStatus = 'SAVE'
          this.formGroup.reset()
        }
      })
  }


  changeLocation(event){
    //console.log(event)
    this.selectedLocation = event.target.value
    this.loadSelectedRoles()
    this.loadNotSelectedRoles()
  }


  //load country list
  loadLocations():Observable<Array<any>>{
    return this.http.get(this.apiUrl + 'org/locations?fields=loc_id,loc_name')
        .pipe( map( res => res['data']) )
  }

  //load department list
  loadDepartments():Observable<Array<any>>{
    //Sconsole.log("Ssss");
    return this.http.get(this.apiUrl + 'org/departments?fields=dep_id,dep_name')
        .pipe( map( res => res['data']) )
  }


  //load designation list
  loadDesignations():Observable<Array<any>>{
    //Sconsole.log("Ssss");
    return this.http.get(this.apiUrl + 'admin/designations?fields=desig_id,desig_name')
        .pipe( map( res => res['data']) )
  }

  //load CostCenter list
  loadCostCenters():Observable<Array<any>>{
    //Sconsole.log("Ssss");
    return this.http.get(this.apiUrl + 'finance/accounting/cost-centers?fields=cost_center_id,cost_center_name')
        .pipe( map( res => res['data']) )
  }

  //load CostCenter list
  loadUsers():Observable<Array<any>>{
    //Sconsole.log("Ssss");
    return this.http.get(this.apiUrl + 'admin/users?fields=user_id,first_name,last_name')
        .pipe( map( res => res['data']) )
  }


  loadSelectedRoles(){
    let data = { user_id : this.formGroup.get('user_id').value , type : 'assigned', location : this.selectedLocation}
    this.selectedRoles$ = this.http.get<any>(this.apiUrl + 'admin/users/roles', { params : data})
    .pipe( map(res => res['data']))
  }

  loadNotSelectedRoles() {
    let data = { user_id : this.formGroup.get('user_id').value , type : 'not_assigned', location : this.selectedLocation }
    this.notSelectedRoles$ = this.http.get<any>(this.apiUrl + 'admin/users/roles' , {params : data})
    .pipe( map(res => res['data']))
  }


  loadSelectedLocations(){
    let data = { user_id : this.formGroup.get('user_id').value , type : 'assigned'}
    this.selectedLocations$ = this.http.get<any>(this.apiUrl + 'admin/users/locations', { params : data})
    .pipe( map(res => res['data']))
  }

  loadNotSelectedLocations() {
    let data = { user_id : this.formGroup.get('user_id').value , type : 'not_assigned' }
    this.notSelectedLocations$ = this.http.get<any>(this.apiUrl + 'admin/users/locations' , {params : data})
    .pipe( map(res => res['data']))
  }

}
