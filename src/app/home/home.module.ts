import { NgModule , ModuleWithProviders } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { SnotifyModule, SnotifyService, ToastDefaults } from 'ng-snotify';

import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../shared';
import { CoreModule } from '../core';

import { HomeComponent } from './home.component';
import { LoginComponent } from './login/login.component';

/*const homeRouting: ModuleWithProviders = RouterModule.forRoot([
  {   path: '/',   redirectTo: 'home', pathMatch: 'full' },
  {   path: 'home',   component: HomeComponent }
]);*/

@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule,
    CoreModule,
    ReactiveFormsModule,
    SnotifyModule
  ],
  declarations: [
    HomeComponent,
    LoginComponent
  ],
  providers : [
    { provide: 'SnotifyToastConfig', useValue: ToastDefaults},
    SnotifyService,
    Title
  ],
  exports : [HomeComponent]
})
export class HomeModule { }
