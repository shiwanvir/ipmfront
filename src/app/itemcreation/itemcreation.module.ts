import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';

import { ItemcreationRoutingModule } from './itemcreation-routing.module';

import { SubcategoryComponent } from './subcategory/subcategory.component';
import { AssignpropertiesComponent } from './assignproperties/assignproperties.component';
import { ItemcreationwizardComponent } from './itemcreationwizard/itemcreationwizard.component';
import { ItemgroupComponent } from './itemgroup/itemgroup.component';
import { ItemlistingComponent } from './itemlisting/itemlisting.component';

import { HomeModule } from '../home';

@NgModule({
  imports: [
    CommonModule,
    ItemcreationRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    ModalModule.forRoot(),
    HomeModule
  ],
  declarations: [SubcategoryComponent, AssignpropertiesComponent, ItemcreationwizardComponent, ItemgroupComponent, ItemlistingComponent],
  exports:[ReactiveFormsModule]
})

export class ItemcreationModule { }
