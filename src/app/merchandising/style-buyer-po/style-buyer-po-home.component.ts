import { Component, OnInit, ViewChild } from '@angular/core';

import { TabsetComponent } from 'ngx-bootstrap';

import { BuyerPoService } from './buyer-po.service';

@Component({
  selector: 'app-style-buyer-po-home',
  templateUrl: './style-buyer-po-home.component.html',
  styleUrls: []
})
export class StyleBuyerPoHomeComponent implements OnInit {

  @ViewChild('buyerPoTabs') tabs: TabsetComponent;

  constructor(private buyerPoService : BuyerPoService) { }

  ngOnInit() {

    this.buyerPoService.poData
    .subscribe(data => {
      if(data != null){
        this.tabs.tabs[1].active = true;
      }        
    })

  }

  onSelect(e){

  }



}
