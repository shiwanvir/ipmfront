import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from '../core/layout/header/header.component';
import { LeftMenuComponent } from '../core/layout/left-menu/left-menu.component';
import { FooterComponent } from '../core/layout/footer/footer.component';
import { MultiselectComponent } from '../core/components/multiselect/multiselect.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [
    HeaderComponent,
    LeftMenuComponent,
    FooterComponent,
	MultiselectComponent
  ],
  providers : [],
  exports : [
    HeaderComponent,
    LeftMenuComponent,
    FooterComponent,
	  MultiselectComponent
  ]
})
export class CoreModule { }
