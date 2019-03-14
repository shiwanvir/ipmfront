import { Component, OnInit, ViewChild , AfterViewInit} from '@angular/core';
import { TabsetComponent,TabDirective} from 'ngx-bootstrap';
import { ActivatedRoute } from '@angular/router';

import {CancellationCategoryComponent } from "./cancellation-category.component";
import {CancellationReasonComponent }from "./cancellation-reason.component";
@Component({
  selector: 'app-cancellation',
  templateUrl: './cancellation.component.html',
  styleUrls: []
})
export class CancellationComponent implements OnInit {

  @ViewChild('cancellationTabs') cancellationTabs: TabsetComponent;
  @ViewChild(CancellationCategoryComponent) childCancellationCategory: CancellationCategoryComponent;
  @ViewChild(CancellationReasonComponent) childCancellationReason: CancellationReasonComponent;

  constructor(private router: ActivatedRoute) { }


      ngOnInit() {
        this.router.data
        .subscribe(res => {
            if(res.tabName == 'CANCELLATIONCATEGORY'){
              this.cancellationTabs.tabs[0].active = true;
              this.childCancellationCategory.createTable()
            }
            else if(res.tabName == 'CANCELLATIONREASON'){
              this.cancellationTabs.tabs[1].active = true;
              this.childCancellationReason.createTable()
            }

        });
      }
      ngAfterViewInit(){

      }

      onSelect(data: TabDirective): void {
        switch(data.heading){
          case 'Cancellation Category' :
            if(this.childCancellationCategory.datatable == null){
                this.childCancellationCategory.createTable()
            }
            break;
          case 'Cancellation Reason' :
            if(this.childCancellationReason.datatable == null){
                this.childCancellationReason.createTable()
            }
            break;

        }
      }

}
