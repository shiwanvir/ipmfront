import { Component, OnInit,ViewChild } from '@angular/core';
import { TabsetComponent } from 'ngx-bootstrap';
import { MeterialTranferService} from './meterial-transfer.service';

@Component({
  selector: 'app-meterial-transfer-in-home',
  templateUrl: './meterial-transfer-in-home.component.html',
  styleUrls: []
})

export class MeterialTransferInHomeComponent{

  @ViewChild('tabs') tabs: TabsetComponent;

    constructor(private meterialTransferIn:MeterialTranferService) { }

    ngOnInit() {

      this.meterialTransferIn.meterialTransferData.subscribe(data => {
        if(data != null && data != ''){
            this.tabs.tabs[1].active = true;
        }
        //this.message = data
      })
    }

    reloadData(){

    }



}
