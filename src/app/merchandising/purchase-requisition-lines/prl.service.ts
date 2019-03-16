import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class PrlService {

  private dataSource = new BehaviorSubject<any>(null)
  lineData = this.dataSource.asObservable()



  constructor() { }

  changeData(data){
    this.dataSource.next(data)
  //alert('ddd')
  }





}
