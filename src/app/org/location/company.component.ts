import { Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, of, concat } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map } from 'rxjs/operators';

//third part components
import { ModalDirective } from 'ngx-bootstrap/modal';
declare var $:any;

import { AppFormValidator } from '../../core/validation/app-form-validator';
import { PrimaryValidators } from '../../core/validation/primary-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

//models
import { Country } from '../models/country.model';
import { Currency } from '../models/currency.model';
import { Department } from '../models/department.model';
import { Section } from '../models/section.model';


@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['../../../styles/validation.css']
})
export class CompanyComponent implements OnInit {

  @ViewChild(ModalDirective) companyModel: ModalDirective;

  formGroup : FormGroup
  popupHeaderTitle : string = "New Company"
  readonly apiUrl = AppConfig.apiUrl()
  formValidator : AppFormValidator
  datatable:any = null
  saveStatus = 'SAVE'
  initialized : boolean = false
  loading : boolean = false
  loadingCount : number = 0
  processing : boolean = false

  companyList = [];
  clusterList$:Observable<Array<any>>//observable to featch source list

  country$: Observable<Country[]>;
  countryLoading = false;
  countryInput$ = new Subject<string>();
  selectedCountry:Country

  currency$: Observable<Currency[]>;
  currencyLoading = false;
  currencyInput$ = new Subject<string>();
  selectedCurrency:Currency

  departments$: Observable<Department[]> //
  departmentsLoading = false;
  departmentsInput$ = new Subject<string>();
  selectedDepartments: Department[] = <any>[{dep_id:4,dep_name:'HR'}];

  section$: Observable<Section[]>
  sectionsLoading = false;
  sectionsInput$ = new Subject<string>();
  selectedSections: Section[]
  selectedSection:number = 1

/*  formFields = {
    group_id : '',
    company_code : '',
    company_name : '',
    company_address_1 : '',
    city : '',
    country_code : '',
    company_reg_no :'',
    company_contact_1 : '',
    company_email : '',
    tax_code :  '',
    default_currency : '',
    finance_month : ''
  }*/


  constructor(private fb:FormBuilder , private http:HttpClient) { }

  ngOnInit() {

    this.initializeForm()

  }

  //load data and initialize forms
  loadModelData() {
    this.loading = true;
    this.loadingCount = 0;
    AppAlert.showMessage('<i class="icon-spinner2 spinner text-info"></i> Loading...','Please wait while loading data')
    this.loadClusterList()

    if(this.initialized == false){
      this.initializeForm()
      this.loadCurrency()
      this.loadCountry()
      this.loadDepartments()
      this.loadSections()
      this.initialized = true;
    }
  }

  //chek all data were loaded, if loaded active save button
  checkProcessingStatus(){
    if(this.loadingCount >= 1){
      this.loading = false
      this.loadingCount = 0
      setTimeout(() => {
        AppAlert.closeAlert()
      } , 500)
    }
  }

  //create form, initialize the validation and suscribe for form value changes
  initializeForm() {
      let remoteValidationConfig = { //configuration for company code remote validation
        url:this.apiUrl + 'org/companies/validate?for=duplicate',
        /*formFields : null,//this.formFields,*/
        fieldCode : 'company_code',
        error : 'Company code already exists',
        data : {
          company_id : function(controls){ return controls['company_id']['value']}
        }
      }

      let primaryValidator = new PrimaryValidators(this.http)//create object of basic validation class

      this.formGroup = this.fb.group({
        company_id : 0,
        group_id : [null , [Validators.required]],
        company_code : [null , [Validators.required],[primaryValidator.remote(remoteValidationConfig)]],
        company_name : [null , [Validators.required,Validators.minLength(4)]],
        company_address_1 : [null , [Validators.required]],
        company_address_2 : null,
        city : [null , [Validators.required]],
        country_code : [null , [Validators.required]],
        company_reg_no :[null , [Validators.required]],
        company_contact_1 : [null , [Validators.required]],
        company_contact_2 : null,
        company_fax : null,
        company_email : [null ,[Validators.required,Validators.email]],
        company_web : null,
        company_remarks : null,
        vat_reg_no : null,
        tax_code :  [null , [Validators.required]],
        default_currency : [null , [Validators.required]],
        finance_month : [null , [Validators.required]],
        company_logo : null,
        sections : [],
        departments : []
      })

      //create new validation object
      //this.appValidator = new AppValidator(this.formFields,{},this.formGroup);
      let customErrorMessages = {
        company_name : {
          required : 'Company name is required'
        }
      }
      this.formValidator = new AppFormValidator(this.formGroup , customErrorMessages)

      /*this.formGroup.valueChanges.subscribe(data => { //validate form when form value changes
        console.log(data)
        this.appValidator.validate();
      })*/
  }


  //initialize datatable
  createTable() {
     this.datatable = $('#company_tbl').DataTable({
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
          "url": this.apiUrl + "org/companies?type=datatable"
      },
       columns: [
            {
              data: "company_id",
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
          { data: "group_name" },
          { data: "company_code" },
          { data: "company_name" },
          { data: "company_address_1" },
          { data: "company_address_2" },
          { data: "city" },
          { data: "country_code" },
          { data: "company_reg_no" },
          { data: "company_contact_1" },
          { data: "default_currency" },
          { data : 'finance_month'}
       ],
       columnDefs: [{
         orderable: false,
         width: '100px',
         targets: [ 0 ]
       }]
     });

     //listen to the click event of edit and delete buttons
     $('#company_tbl').on('click','i',e => {
        let att = e.target.attributes;
        if(att['data-action']['value'] === 'EDIT'){
           this.edit(att['data-id']['value']);
        }
        else if(att['data-action']['value'] === 'DELETE'){
           this.delete(att['data-id']['value']);
        }
     });
  }

  //reload datatable
  reloadTable() {
    this.datatable.ajax.reload(null, false);
  }


  //load country list - ng select plugin
  loadCountry() {
       this.country$ = concat(
           of([]), // default items
           this.countryInput$.pipe(
              debounceTime(200),
              distinctUntilChanged(),
              tap(() => this.countryLoading = true),
              switchMap(term => this.http.get<Country[]>(this.apiUrl + 'org/countries?type=auto',{params:{search:term}}).pipe(
                  catchError(() => of([])), // empty list on error
                  tap(() => this.countryLoading = false)
              ))
           )
       );
   }

   //load currency list - ng select plugin
   loadCurrency() {
        this.currency$ = concat(
            of([]), // default items
            this.currencyInput$.pipe(
               debounceTime(200),
               distinctUntilChanged(),
               tap(() => this.currencyLoading = true),
               switchMap(term => this.http.get<Currency[]>(this.apiUrl + 'finance/currencies?type=auto',{params:{search:term}}).pipe(
                   catchError(() => of([])), // empty list on error
                   tap(() => this.currencyLoading = false)
               ))
            )
        );
    }

    //load cluster list
    loadClusterList() {
        this.clusterList$ = this.http.get<Array<any>>(this.apiUrl + 'org/clusters?active=1&fields=group_id,group_name')
        .pipe(
          tap(res => {
            this.loadingCount++;
            this.checkProcessingStatus()
          }),
          map( res => res['data'] )
        )
    }


    //load departments - ng select plugin
    loadDepartments() {
         this.departments$ = concat(
             of([]), // default items
             this.departmentsInput$.pipe(
                debounceTime(200),
                distinctUntilChanged(),
                tap(() => this.departmentsLoading = true),
                switchMap(term => this.http.get<Department[]>(this.apiUrl + 'org/departments?type=auto',{params:{search:term}}).pipe(
                    catchError(() => of([])), // empty list on error
                    tap(() => this.departmentsLoading = false)
                ))
             )
         );
     }

     //load sections - ng select plugin
     loadSections() {
          this.section$ = concat(
              of(this.selectedSections), // default items
              this.sectionsInput$.pipe(
                 debounceTime(200),
                 distinctUntilChanged(),
                 tap(() => this.sectionsLoading = true),
                 switchMap(term => this.http.get<Section[]>(this.apiUrl + 'org/sections?type=auto',{params:{search:term}}).pipe(
                     catchError(() => of([])), // empty list on error
                     tap(() => this.sectionsLoading = false)
                 ))
              )
          );
      }


    //save or update company details
    saveCompany() {

      if(!this.formValidator.validate())//if validation faild return from the function
        return;
      this.processing = true
      AppAlert.showMessage('Processing...','Please wait while saving details')

      let formData = this.formGroup.getRawValue()
      formData['country_code'] = formData['country_code']['country_id']
      formData['default_currency'] = formData['default_currency']['currency_id']

      let saveOrUpdate$ = null;
      let companyId = this.formGroup.get('company_id').value
      if(this.saveStatus == 'SAVE'){
        saveOrUpdate$ = this.http.post(this.apiUrl + 'org/companies', formData)
      }
      else if(this.saveStatus == 'UPDATE'){
        saveOrUpdate$ = this.http.put(this.apiUrl + 'org/companies/' + companyId , formData)
      }

      saveOrUpdate$.subscribe(
        (res) => {
          this.processing = false
          this.formGroup.reset();
          this.reloadTable()
          this.companyModel.hide()
          setTimeout(() => {
            AppAlert.closeAlert()
            AppAlert.showSuccess({text : res.data.message })
          } , 500)
       },
       (error) => {
          this.processing = false
          AppAlert.closeAlert()
          AppAlert.showSuccess({text : 'Process Error' })
          console.log(error)
       }
     );
    }


    //get payment term data and open the model
    edit(id) {
      this.http.get(this.apiUrl + 'org/companies/' + id)
      .pipe(map( data => data['data'] ))
      .subscribe(data => {
        if(data['status'] == '1')
        {
          this.saveStatus = 'UPDATE'
          this.companyModel.show()
          console.log(data);
          this.formGroup.setValue({
            company_id : data['company_id'],
            group_id : data['group_id'],
            company_code : data['company_code'],
            company_name : data['company_name'],
            company_address_1 : data['company_address_1'],
            company_address_2 : data['company_address_2'],
            city : data['city'],
            country_code : data['country'],
            company_reg_no : data['company_reg_no'],
            company_contact_1 : data['company_contact_1'],
            company_contact_2 : data['company_contact_2'],
            company_fax : data['company_fax'],
            company_email : data['company_email'],
            company_web : data['company_web'],
            company_remarks : data['company_remarks'],
            vat_reg_no : data['vat_reg_no'],
            tax_code :  data['tax_code'],
            default_currency : data['currency'],
            finance_month : data['finance_month'],
            company_logo : '',
            sections : data['sections'],
            departments : data['departments']
          })

        }
      })
    }


    //deactivate payment term
    delete(id) {
      AppAlert.showConfirm({
        'text' : 'Do you want to deactivate selected company?'
      },(result) => {
        if (result.value) {
          AppAlert.showMessage('Processing...','Please wait while deliting company')
          this.http.delete(this.apiUrl + 'org/companies/' + id)
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


  //show event of the bs model
  showEvent(event){
    if(this.saveStatus == 'SAVE'){
      this.popupHeaderTitle = 'New Company'
      this.formGroup.get('company_code').enable()
      this.formGroup.reset();
      this.loadModelData()
    }
    else if(this.saveStatus == 'UPDATE') {
      this.popupHeaderTitle = 'Update Company'
      this.formGroup.get('company_code').disable()
      this.loadModelData()
    }
  }

}
