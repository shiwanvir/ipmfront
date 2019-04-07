import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

//third pirt routingComponents
declare var $: any;

import {AppFormValidator} from '../../core/validation/app-form-validator';
import {AppValidator} from '../../core/validation/app-validator';
import {BasicValidators} from '../../core/validation/basic-validators';
import {AppAlert} from '../../core/class/app-alert';
import {AppConfig} from '../../core/app-config';

@Component({
    selector: 'app-mrn',
    templateUrl: './mrn.component.html',
    styleUrls: ['./mrn.component.css']
})
export class MrnComponent implements OnInit {

    modalGroup: FormGroup
    mrnGroup: FormGroup
    modelTitle: string = "New"
    readonly apiUrl = AppConfig.apiUrl()
    appValidator: AppValidator
    formValidator: AppFormValidator
    datatable: any = null
    saveStatus = 'SAVE'
    initialized: boolean = false
    loading: boolean = false
    loadingCount: number = 0
    processing: boolean = false

    projects = ["AESEMS", "ChainDrive", "CICAND", "CICAPI", "CICiOS", "CICWeb", "KC_APPTV", "KCMagento", "RDLSWeb", "Riddles", "TB", "TBAND", "TBiOS", "TestProject"]
    location$: Observable<any[]>;//use to load location list in ng-select
    locationLoading = false;
    locationInput$ = new Subject<string>();
    selectedLocation: any[]

    section$: Observable<any[]>;//use to load Section list in ng-select
    sectionLoading = false;
    sectionInput$ = new Subject<string>();
    selectedSection: any[]

    requestType$: Observable<any[]>;//use to load requestType list in ng-select
    requestTypeLoading = false;
    requestTypeInput$ = new Subject<string>();
    selectedRequestType: any[]


    mainCategory$: Observable<any[]>;//use to load main category list in ng-select
    mainCategoryLoading = false;
    mainCategoryInput$ = new Subject<string>();
    selectedmainCategory: any[]

    subCategory$: Observable<any[]>;//use to load main sub category list in ng-select
    subCategoryLoading = false;
    subCategoryInput$ = new Subject<string>();
    selectedsubCategory: any[]

    styleNo$: Observable<any[]>;
    styleNoLoading = false;
    styleNoInput$ = new Subject<string>();
    selectedStyleNo: any[]

    sc$: Observable<any[]>;
    scLoading = false;
    scInput$ = new Subject<string>();
    selectedSc: any[]

    customerPo$: Observable<any[]>;
    customerPoLoading = false;
    customerPoInput$ = new Subject<string>();
    selectedCustomerPo: any[]

    formFields = {
        mrn_no: '',
        loc_name: '',
        sec_name: '',
        line_no: '',
        request_type: '',
        category_name: '',
        subcategory_name: '',
        style_no: '',
        sc: '',
        customer_po: '',
        validation_error: ''

    }

    constructor(private http: HttpClient, private fb: FormBuilder) {
    }

    ngOnInit() {
        this.section$ = this.loadSection()

        this.mrnGroup = this.fb.group({ // create the form
            mrn_no: [0],
            loc_name: [],
            sec_name: [],
            qty: [],
            request_type: []

        })

        this.modalGroup = this.fb.group({ // create the form
            dep_id: [],
            request_type: [],
            style_no: [],
            sc: [],
            customer_po: [],
            category_name: [],
            subcategory_name: [],
            item_list : this.fb.array([]),

        })

    }


    loadSection(): Observable<Array<any>> {
        return this.http.get<any[]>(this.apiUrl + 'org/sections?active=1$fields=section_name,section_id')
            .pipe(map(res => res['data']))
    }

    loadTest(){
       // alert('q')
       //return this.http.get<any[]>( this.apiUrl + 'store/stores?active=1&fields=store_id,store_name')
        //    .pipe( map( res => res['data']) )

       /* this.http.get(this.apiUrl + 'merchandising/load-po-header-data',1).subscribe(data => {
            alert('s')
        })*/


    }

    searchItems(e){
        var dataArr =  this.modalGroup.value;
        this.http.post(this.apiUrl + 'stores/load-stock-for-mrn', dataArr).subscribe(data => {
         console.log(data);
        })

    }


    formValidate() {

    }

    showEvent(e) {
        this.styleNo$ = this.http.get(this.apiUrl + 'merchandising/style?status=1&fields=style_id,style_no&type=select', ).pipe( map( res => res['data']) )
    }

    loadSCList(){
        this.sc$ = this.http.get(this.apiUrl + 'merchandising/customer-orders?fields=order_id,order_code', ).pipe( map( res => res['data']) )
    }



}
