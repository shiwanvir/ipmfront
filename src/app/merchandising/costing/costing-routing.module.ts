import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from '../../home/home.component';


// import { HomeComponent } from '../home/home.component';

import { FlashComponent } from './flash/flash.component';
/*import { BulkComponent } from './bulk/bulk.component';*/

const routes: Routes = [
  {path : '' , component : HomeComponent ,children:
    [
      {path : 'flashcosting' , component : FlashComponent },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CostingRoutingModule { }

export const CostingRoutingModuleComponents = [

];
