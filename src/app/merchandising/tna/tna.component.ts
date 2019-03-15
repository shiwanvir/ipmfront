
import { Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder , FormGroup , Validators,FormControl,FormArray,ValidatorFn} from '@angular/forms';
import { Subject, Observable, of, concat } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, delay, map} from 'rxjs/operators';

import { AppConfig } from '../../core/app-config';
// import Swal from 'sweetalert2';

import { Style } from '../models/style.model';

@Component({
  selector: 'app-tna',
  templateUrl: './tna.component.html',
  styleUrls: [/*'./tna.component.css'*/]
})
export class TnaComponent implements OnInit {

  formGroup : FormGroup
  style$:Observable<Array<any>>//observable to featch source list
  styleLoading = false;
  styleInput$ = new Subject<string>();
  selectedStyle:Style;
  apiUrl = AppConfig.apiUrl();
  constructor(private fb:FormBuilder , private http:HttpClient) {


    this.formGroup = this.fb.group({
      style : [],
    })
  }




  ngOnInit() {
    this.getStyle();
  }

  getStyle() {
    this.style$ = concat(
        of([]), // default items
        this.styleInput$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => this.styleLoading = true),
            switchMap(term => this.http.get<Style[]>(this.apiUrl + 'merchandising/get-style',{params:{search:term}}).pipe(
                catchError(() => of([])), // empty list on error
                tap(() => this.styleLoading = false)
            ))
        )
    );
    // this.customer$ = this.http.get<Array<any>>(this.serverUrl + 'api/getCustomer')
    //     .pipe(map(data => data.data))
  }

  saveStyle(){

  }

}
