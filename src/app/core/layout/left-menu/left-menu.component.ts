import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable /*, Subject*/ } from 'rxjs';
import { map} from 'rxjs/operators';

import { AppConfig } from '../../app-config';
import { MenuService } from '../menu.service';

declare var $:any;

@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.css']
})
export class LeftMenuComponent implements OnInit {

  readonly apiUrl = AppConfig.apiUrl()
  menus$ : Observable<any>
  menus = []

  constructor(/*private router: Router*/private menuService : MenuService, private http:HttpClient ) { }

  ngOnInit() {

  //  if(this.menuService.leftMenus == null){
      this.load_left_menu()
    //}
  //  else{
    //  this.menus = this.menuService.leftMenus
  //  }
  }

  changeMenu(level, menu_code, e){
    console.log(level + " " + menu_code)
    this.menuService.menu(level,menu_code)
  }

  menuLevels(){
    return this.menuService.menuLevels
  }


  //load left menu
  load_left_menu() {
  /*  this.menus$ = */this.http.get<any>(this.apiUrl + "app/menus")
    .pipe( map(res => res['data']) )
    .subscribe(data => {
      this.menus = data
    })
  }


  /*activeRoute(routename: string): boolean{
        return this.router.url.indexOf(routename) > -1;
    }*/





  /*  changeMenu(e){
      alert();
      //e.preventDefault();
//debugger;
      // Collapsible
      $(e.target).parent('li').not('.disabled').not($('.sidebar-xs').not('.sidebar-xs-indicator').find('.navigation-main').children('li')).toggleClass('active').children('ul').slideToggle(250);

      // Accordion
      if ($('.navigation-main').hasClass('navigation-accordion')) {
          $(e.target).parent('li').not('.disabled').not($('.sidebar-xs').not('.sidebar-xs-indicator').find('.navigation-main').children('li')).siblings(':has(.has-ul)').removeClass('active').children('ul').slideUp(250);
      }
    }*/

}
