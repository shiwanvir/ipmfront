import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';


import { AuthService } from '../../service/auth.service';
import { AppConfig } from '../../app-config';
import { AppAlert } from '../../class/app-alert';
//import { MenuService } from '../menu.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'/*,
  styleUrls: ['./header.component.css']*/
})
export class HeaderComponent implements OnInit {

  locations$ : Observable<Array<any>>
  readonly apiUrl = AppConfig.apiUrl()
  display_name : string = ''
  bookmarks$ : Observable<Array<any>>
  currentUserLocation : string = null //show current location in header section

  constructor(private authService:AuthService , private router:Router,private http:HttpClient/*, private menuService : MenuService*/) { }

  ngOnInit() {

    this.loadLocations();
    this.loadBookmarks()
    this.display_name = this.authService.getUserData().first_name

  }

  logout(){
  //  this.menuService.leftMenus = null
    this.authService.deleteToken();
    this.router.navigate(['/login']);
  }

  loadLocations(){
    this.locations$ = this.http.get<Array<any>>(this.apiUrl + 'admin/users/user-assigned-locations')
    .pipe(
      map(res => res['data']),
      tap(res => { //tap operator is use to view current location after login first time
        if(this.currentUserLocation == null){
          let loc_id = this.authService.getUserData().location
          for(let x = 0 ; x < res.length ; x++){
            if(loc_id == res[x]['loc_id']){
              this.currentUserLocation = res[x]['loc_name']
              break
            }
          }
        }
      })
    )
  }

  collapseMenu(){
    document.body.classList.toggle("sidebar-xs");
    document.getElementById('global_search').classList.toggle('global-search-display')
  }

  hideMenu(){
    document.body.classList.toggle('sidebar-main-hidden')
  }

  changeLocation(loc_id, loc_name){
    AppAlert.showConfirm({
      'text' : 'Do you want to change your location to ' + loc_name + ' ?'
    },
    (result) => {
      if (result.value) {
        AppAlert.showMessage('Processing', 'Location changing...')

        this.currentUserLocation = loc_name;
        this.http.post(this.apiUrl + 'auth/refresh', {loc_id : loc_id})
        .subscribe(data => {
          console.log(data)
          this.authService.storeUserData(data['user'])
          this.authService.storeToken(data['access_token'])
          setTimeout(function(){
              AppAlert.closeAlert()
              window.location.reload()
          }, 3000)
          //this.router.navigate(['/home/dashboard']);          
        })
      }
    })
  }

  loadBookmarks(){
    this.bookmarks$ = this.http.get<Array<any>>(this.apiUrl + 'app/bookmarks')
    .pipe( map(res => res['data']) )
  }

}
