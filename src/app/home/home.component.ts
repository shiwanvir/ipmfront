import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map} from 'rxjs/operators';

import {SnotifyService , SnotifyPosition} from 'ng-snotify';

declare var $:any;

import { MenuService } from '../core/layout/menu.service';
import { AppConfig } from '../core/app-config';

//import { ArticleListConfig, TagsService, UserService } from '../core';

@Component({
  selector: 'app-home-page',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(
    private router: Router,
    private menuService : MenuService,
    private snotifyService: SnotifyService,
    private titleService: Title,
    private http:HttpClient
    //private tagsService: TagsService,
  //  private userService: UserService
  ) {}

  isAuthenticated: boolean;
  /*listConfig: ArticleListConfig = {
    type: 'all',
    filters: {}
  };*/
  tags: Array<string> = [];
  tagsLoaded = false;
  aaa : number = 0
  readonly apiUrl = AppConfig.apiUrl()

  tosterConfig = { timeout: 2000, showProgressBar: false, closeOnClick: false , position: SnotifyPosition.rightTop,}

  ngOnInit() {

    // Add 'active' class to parent list item in all levels
    /*$('.navigation').find('li.active').parents('li').addClass('active');

    // Hide all nested lists
    $('.navigation').find('li').not('.active, .category-title').has('ul').children('ul').addClass('hidden-ul');

    // Highlight children links
    $('.navigation').find('li').has('ul').children('a').addClass('has-ul');*/

    // Adjust page height on sidebar control button click
  /*  $(document).on('click', '.sidebar-control', function (e) {
        this.containerHeight();
    });*/

    // Main navigation
    /*$('.navigation-main').find('li').has('ul').children('a').on('click', function (e) {
        //  debugger;
         e.preventDefault();

          // Collapsible
          $(e.target).parent('li').not('.disabled').not($('.sidebar-xs').not('.sidebar-xs-indicator').find('.navigation-main').children('li')).toggleClass('active').children('ul').slideToggle(250);

          // Accordion
          if ($('.navigation-main').hasClass('navigation-accordion')) {
              $(e.target).parent('li').not('.disabled').not($('.sidebar-xs').not('.sidebar-xs-indicator').find('.navigation-main').children('li')).siblings(':has(.has-ul)').removeClass('active').children('ul').slideUp(250);
          }



    });*/



  /*  $('.sidebar-main-toggle').on('click', function (e) {
        e.preventDefault();

        // Toggle min sidebar class
        $('body').toggleClass('sidebar-xs');
    });*/


  }


  bookmarkPage(){
    let bookmarkData = {
      url : this.router.url,
      name : this.titleService.getTitle()
    }
    this.http.post(this.apiUrl + 'app/bookmarks', bookmarkData)
    .pipe( map(res => res['data']) )
    .subscribe(
      data => {
        this.snotifyService.success(data.message , this.tosterConfig)
      },
      error => {
        this.snotifyService.error('Process Error' , this.tosterConfig)
      }
    )
     //this.snotifyService.success(this.titleService.getTitle(), this.tosterConfig)
     //this.snotifyService.success(this.router.url, this.tosterConfig)
  // alert(this.router.url)
  }

  // Calculate min height
  /*  containerHeight() {
       var availableHeight = $(window).height() - $('.page-container').offset().top - $('.navbar-fixed-bottom').outerHeight();

       $('.page-container').attr('style', 'min-height:' + availableHeight + 'px');
   }

  setListTo(type: string = '', filters: Object = {}) {
    // If feed is requested but user is not authenticated, redirect to login
    if (type === 'feed' && !this.isAuthenticated) {
      this.router.navigateByUrl('/login');
      return;
    }

    // Otherwise, set the list object
  //  this.listConfig = {type: type, filters: filters};
}*/
}
