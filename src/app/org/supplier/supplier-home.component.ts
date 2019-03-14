import { Component, OnInit,ViewChild } from '@angular/core';
import { TabsetComponent } from 'ngx-bootstrap';

import { SupplierService } from './supplier.service';

@Component({
  selector: 'app-supplier-home',
  templateUrl: './supplier-home.component.html',
  styleUrls: []
})
export class SupplierHomeComponent implements OnInit {

  //message:string
  @ViewChild('tabs') tabs: TabsetComponent;

  constructor(private supplier:SupplierService) { }

  ngOnInit() {

    this.supplier.supplierData.subscribe(data => {
      if(data != null && data != ''){
          this.tabs.tabs[1].active = true;
      }
      //this.message = data
    })
  }

  reloadData(){

  }

}
