import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgOption } from '@ng-select/ng-select';
declare var $: any;

import { AppValidator } from '../../core/validation/app-validator';
import { BasicValidators } from '../../core/validation/basic-validators';
import { AppConfig } from '../../core/app-config';
import { AppAlert } from '../../core/class/app-alert';

@Component({
  selector: 'app-bin-config',
  templateUrl: './bin-config.component.html',
  styleUrls: ['./bin-config.component.css']
})
export class BinConfigComponent implements OnInit {

  @ViewChild(ModalDirective) binModel: ModalDirective;

  formGroup: FormGroup
  formCapacity: FormGroup
  items: FormArray;

  modelTitle: string = "New Bin"
  apiUrl = AppConfig.apiUrl()

  appValidator: AppValidator
  appValidatorCapacity: AppValidator

  datatable: any = null
  saveStatus = 'SAVE'
  url = this.apiUrl + 'store/bin-config'

  storeList$: Observable<Array<any>>
  subStoreList$: Observable<Array<any>>
  binList$: Observable<Array<any>>
  categoryList$: Observable<Array<any>>
  itemCategory$: Observable<Array<any>>

  binId = 0

  formFields = {
    store_id: '',
    substore_id: '',
    category_name:''
  }

  formFieldCapacity = {
    category_name: '',
    bin_id: 0,
    allocation_id: 0
  }

  constructor(private fb: FormBuilder, private http: HttpClient) { }

  ngOnInit() {

    let basicValidator = new BasicValidators(this.http)//create object of basic validation class

    this.formGroup = this.fb.group({ // create the form

      store_id: [null, [Validators.required]],
      substore_id: [null, [Validators.required]],
      category_name : null
    })

    /*this.formCapacity = this.fb.group({ // create the form
      category_name: [null, [Validators.required]],
      bin_id: [null]
    })*/

    this.formCapacity = this.fb.group({
      bin_id: null,
      category_name: [null, [Validators.required]],
      allocation_id: null,
      items: this.fb.array([])
    });

    this.storeList$ = this.getStoreList()
    this.subStoreList$ = this.getSubStoreList()

    this.appValidator = new AppValidator(this.formFields, [], this.formGroup);
    this.appValidatorCapacity = new AppValidator(this.formFieldCapacity, [], this.formCapacity);
  }

  /*  createItem(): FormGroup {
      return this.fb.group({
        subCategoryId: '',
        capacity: '',
        width: '',
        height: '',
        length: ''
      });
    }*/

  getStoreList(): Observable<Array<any>> {
    return this.http.get<any[]>(this.apiUrl + 'store/stores?active=1&fields=store_id,store_name')
      .pipe(map(res => res['data']))
  }

  getSubStoreList(): Observable<Array<any>> {
    return this.http.get<any[]>(this.apiUrl + 'store/substore?active=1&fields=substore_id,substore_name')
      .pipe(map(res => res['data']))
  }

  getCategoryList(): Observable<Array<any>> {
    return this.http.get<any[]>(this.apiUrl + 'store/storebin?type=getCategory')
      .pipe(map(res => res))
  }

  loadBins() {
    let getBinlist$ = null;
    let store = this.formGroup.get('store_id').value;
    let substore = this.formGroup.get('substore_id').value;
    if (store != null && substore != null) {
      getBinlist$ = this.http.get(this.apiUrl + 'store/storebin?type=getBins&storeId=' + store.store_id + "&substoreId=" + substore.substore_id);
      getBinlist$.subscribe(
        (res) => {
          this.binList$ = res['data']
        },
        (error) => {
          //  console.log(error)
        }
      );

    }

  }

  configurPopup(id: number) {
    /*let getCategoryList$ = null;
    getCategoryList$ = this.http.get(this.apiUrl + 'store/storebin?type=getCategory');
    getCategoryList$.subscribe(
      (res) => {
        this.categoryList$ = res
      },
      (error) => {

      }
    );*/
    this.categoryList$ = this.getCategoryList();
    this.binId = id

    this.edit(id);
    //this.categoryList$
    this.binModel.show()
  }

  loadItemGategories() {
    let getItemCategory$ = null;
    let category = this.formCapacity.get('category_name').value;

    var programmingFormArray = <FormArray>this.formCapacity.get('items')
    var lines = programmingFormArray.length;
    if (lines > 0) {
      for (var j = 0; j <= (lines - 1); j++) {
        programmingFormArray.removeAt(0);
      }
    }

    if (category != null && category.category_id != null) {
      getItemCategory$ = this.http.get(this.apiUrl + 'store/storebin?type=getItemCategory&category_id=' + category.category_id);
      getItemCategory$.subscribe(
        (res) => {
          this.itemCategory$ = res['data']


          var item = res['data']
          var count = Object.keys(item).length;



          if (count > 0) {
            for (var i = 0; i <= (count - 1); i++) {
              console.log(item[i]['subcategory_id']);
              const control = new FormGroup({
                'subCategoryId': new FormControl(item[i]['subcategory_id']),
                'subcategory_name': new FormControl(item[i]['subcategory_name']),
                'capacity': new FormControl(),
                'width': new FormControl(),
                'height': new FormControl(),
                'length': new FormControl(),
                'itemCheckedbox': new FormControl(),
              });
              // console.log(control);
              (<FormArray>this.formCapacity.get('items')).push(control);

            }
          }

        },
        (error) => {
          //  console.log(error)
        }
      );

    }

  }



  edit(bin_id) { //get payment term data and open the model
    let updateBinConfig$ = null;
    updateBinConfig$ = this.http.get(this.url + '?type=getBinData&bin_id=' + bin_id)
    updateBinConfig$.subscribe(
      (res) => {
        var binConfig = res['data']['allocatedArray'];
        var count = 0;

        count = Object.keys(binConfig).length;

        var programmingFormArray = <FormArray>this.formCapacity.get('items')
        var lines = programmingFormArray.length;
        if (lines > 0) {
          for (var j = 0; j <= (lines - 1); j++) {
            programmingFormArray.removeAt(0);
          }
        }

        this.formCapacity.get('category_name').reset()
        this.formCapacity.get('category_name').enable()

        if (binConfig) {

          this.modelTitle = "Update Bin"


          if (count > 0) {
            this.formCapacity.get('category_name').disable()

            this.formCapacity.patchValue({
              category_name: { category_id: binConfig[0]['item_category_id'], category_name: binConfig[0]['item_category_name'] }
            });

            for (var i = 0; i <= (count - 1); i++) {

              const control = new FormGroup({
                'subCategoryId': new FormControl(binConfig[i]['item_subcategory_id']),
                'capacity': new FormControl(binConfig[i]['max_capacity']),
                'width': new FormControl(binConfig[i]['width']),
                'height': new FormControl(binConfig[i]['height']),
                'length': new FormControl(binConfig[i]['length']),
                'itemCheckedbox': new FormControl(binConfig[i]['allocation_id']),
                'subcategory_name': new FormControl(binConfig[i]['item_name']),
              });
              (<FormArray>this.formCapacity.get('items')).push(control);

            }
          }
        }


      })
  }


  saveCapacity() {
    let saveOrUpdate$ = null;
    let id = this.formCapacity.get('allocation_id').value
    let objectArr = null;


    objectArr = this.formCapacity.getRawValue();
    objectArr['category_name'] = objectArr['category_name']['category_id'];

    if (this.saveStatus == 'SAVE') {
      saveOrUpdate$ = this.http.post(this.url, objectArr);
      saveOrUpdate$.subscribe(
        (res) => {
          AppAlert.showSuccess({ text: res.data.message })

          this.loadBins();
          //this.formGroup.reset();
          //this.reloadTable();
          //  this.formGroup.controls['store_bin_name'].reset();
          //  this.formGroup.controls['store_bin_description'].reset();
          //this.binModel.hide()
        },
        (error) => {
          console.log(error)
        }
      );
    }
    /*else if (this.saveStatus == 'UPDATE') {
      saveOrUpdate$ = this.http.put(this.url + '/' + id, objectArr);
      saveOrUpdate$.subscribe(
        (res) => {
          AppAlert.showSuccess({ text: res.data.message })
          //this.formGroup.reset();
          //this.reloadTable();
          //this.binModel.hide()
        },
        (error) => {
          console.log(error)
        }
      );
    }*/
    console.log(this.formCapacity.getRawValue());
  }

}
