import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class PoService {

  private dataSource = new BehaviorSubject<any>(null)
  poData = this.dataSource.asObservable()

  private dataSource2 = new BehaviorSubject<any>(null)
  poData2 = this.dataSource2.asObservable()

  constructor() { }

  changeData(data){
    this.dataSource.next(data)
  //alert('ddd')
  }

  changeData2(data){
    this.dataSource2.next(data)
  //alert('bbb')
  }



}
