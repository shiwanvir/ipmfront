//import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlashComponent } from './flash/flash.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';
//import { CostingRoutingModule /*, MerchandisingRoutingModuleComponents*/ } from './costing-routing.module';
//import { ReactiveFormsModule , FormsModule } from '@angular/forms';
//import { HomeModule } from '../../home';

@NgModule({
  imports: [
    //BrowserModule,
    CommonModule,
    FormsModule,        
    ReactiveFormsModule,
    NgSelectModule
    /*HomeModule*/
    
    /*CostingRoutingModule,*/
  ],
  declarations: [FlashComponent]
})
export class CostingModule { }
