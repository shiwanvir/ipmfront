import { Component, OnInit, ViewChild } from '@angular/core';

import { TabsetComponent } from 'ngx-bootstrap';

import { RoleService } from '../role.service';

@Component({
  selector: 'app-role-home',
  templateUrl: './role-home.component.html',
  styleUrls: ['./role-home.component.css']
})
export class RoleHomeComponent implements OnInit {

  @ViewChild('roleTabs') tabs: TabsetComponent;

  constructor(private roleService : RoleService) { }

  ngOnInit() {

   this.roleService.role_data
    .subscribe(data => {
      if(data != null){
        this.tabs.tabs[1].active = true;
      }
    })

  }

  onSelect(e){

  }


}
