import { Component, OnInit , ViewChild , AfterViewInit} from '@angular/core';
import { TabsetComponent,TabDirective} from 'ngx-bootstrap';
import { ActivatedRoute } from '@angular/router';

import { SourceComponent } from './source.component';
import { ClusterComponent } from './cluster.component';
import { CompanyComponent } from './company.component';
import { CompanyLocationComponent } from './company-location.component';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: []
})
export class LocationComponent implements OnInit {

  @ViewChild('locationTabs') locationTabs: TabsetComponent;
  @ViewChild(SourceComponent) childSource: SourceComponent;
  @ViewChild(ClusterComponent) childCluster: ClusterComponent;
  @ViewChild(CompanyComponent) childCompany: CompanyComponent;
  @ViewChild(CompanyLocationComponent) childLocation: CompanyLocationComponent;


  constructor(private router: ActivatedRoute) { }

  ngOnInit() {
    this.router.data
    .subscribe(res => {
        if(res.tabName == 'SOURCE'){
          this.locationTabs.tabs[0].active = true;
          this.childSource.createTable()
        }
        else if(res.tabName == 'CLUSTER'){
          this.locationTabs.tabs[1].active = true;
          this.childCluster.createTable()
        }
        else if(res.tabName == 'COMPANY'){
          this.locationTabs.tabs[2].active = true;
          this.childCompany.createTable()
        }
        else if(res.tabName == 'LOCATION'){
          this.locationTabs.tabs[3].active = true;
          this.childLocation.createTable()
        }
    });
  }


  ngAfterViewInit(){

  }

  onSelect(data: TabDirective): void {
    switch(data.heading){
      case 'Parent Company' :
        if(this.childSource.datatable == null){
            this.childSource.createTable()
        }
        break;
      case 'Cluster' :
        if(this.childCluster.datatable == null){
            this.childCluster.createTable()
        }
        break;
      case 'Company' :
        if(this.childCompany.datatable == null){
            this.childCompany.createTable()
        }
        break;
      case 'Location' :
        if(this.childLocation.datatable == null){
            this.childLocation.createTable()
        }
        break;
    }
  }

}
