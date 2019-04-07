import { Component, OnInit, ViewChild } from '@angular/core';
import { TabsetComponent,TabDirective,TabsetConfig} from 'ngx-bootstrap';
import { SmvupdateService } from './smvupdate.service';
import { ActivatedRoute } from '@angular/router';

import { SmvupdateHistoryComponent } from './smvupdate-history.component';
import { SmvupdateComponent } from './smvupdate.component';


@Component({
  selector: 'app-smvupdate-home',
  templateUrl: './smvupdate-home.component.html',
  styleUrls: [],
  providers: [TabsetConfig]
})
export class SmvupdateHomeComponent implements OnInit {

  @ViewChild('smvupdateTabs') smvupdateTabs: TabsetComponent;
  @ViewChild(SmvupdateComponent) childSmvupdate: SmvupdateComponent;
  @ViewChild(SmvupdateHistoryComponent) childSmvupdateHistory: SmvupdateHistoryComponent;



  constructor(private smvupdateService:SmvupdateService, private router: ActivatedRoute) { }

  ngOnInit() {

    this.router.data
    .subscribe(res => {
        if(res.tabName == 'SMVUPDATE'){
          this.smvupdateTabs.tabs[0].active = true;
          this.childSmvupdate.createTable()
        }
        else if(res.tabName == 'SMVHISTORY'){
          this.smvupdateTabs.tabs[1].active = true;
          this.childSmvupdateHistory.createTable()
        }
    });

  }

  onSelect(data: TabDirective): void {
    switch(data.heading){
      case 'SMV Update' :
        if(this.childSmvupdate.datatable == null){
            this.childSmvupdate.createTable()
        }
        break;
      case 'SMV History' :
        if(this.childSmvupdateHistory.datatable == null){
            this.childSmvupdateHistory.createTable()
            this.smvupdateService.changeStatus('RELOAD_TABLE')

        }
        break;
    }
  }

}
