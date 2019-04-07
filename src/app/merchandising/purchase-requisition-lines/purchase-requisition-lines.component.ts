import { Component, OnInit, ViewChild } from '@angular/core';
import { TabsetComponent } from 'ngx-bootstrap';
import { PrlService } from './prl.service';

@Component({
  selector: 'app-purchase-requisition-lines',
  templateUrl: './purchase-requisition-lines.component.html',
  styleUrls: ['./purchase-requisition-lines.component.css']
})
export class PurchaseRequisitionLinesComponent implements OnInit {
  @ViewChild('potabs') tabs: TabsetComponent;

  constructor(private prlService : PrlService) { }

  ngOnInit() {

    this.prlService.lineData
    .subscribe(data => {
      if(data != null){
        this.tabs.tabs[1].active = true;
      }
    })

  }

  onSelect(e){

  }

}
