import { Component, OnInit, ViewChild } from '@angular/core';
import { TabsetComponent } from 'ngx-bootstrap';
import { PoService } from './po.service';

@Component({
  selector: 'app-purchase-order',
  templateUrl: './purchase-order.component.html',
  styleUrls: ['./purchase-order.component.css']
})
export class PurchaseOrderComponent implements OnInit {

@ViewChild('potabs') tabs: TabsetComponent;

  constructor(private poService : PoService) { }

  ngOnInit() {

    this.poService.poData
    .subscribe(data => {
      if(data != null){
        this.tabs.tabs[1].active = true;
      }
    })

    this.poService.poData2
    .subscribe(data => {
      if(data != null){
        this.tabs.tabs[1].active = true;
      }
    })



  }

  onSelect(e){

  }

 }
