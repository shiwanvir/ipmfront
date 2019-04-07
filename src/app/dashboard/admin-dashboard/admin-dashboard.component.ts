import { Component, OnInit } from '@angular/core';

import { MenuService } from '../../core/layout/menu.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: []
})
export class AdminDashboardComponent implements OnInit {

  constructor(private menuService:MenuService) { }

  ngOnInit() {

    this.menuService.currentComponent = 'Dashboard'

  }

}
