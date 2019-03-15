
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlashComponent } from './flash/flash.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { BulkDetailsComponent } from './bulk-details/bulk-details.component';

import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,        
    ReactiveFormsModule,
    NgSelectModule
  ],
  declarations: [FlashComponent]
  //FlashComponent,BulkDetailsComponent
})
export class CostingModule { }

