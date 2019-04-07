import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { StorebinComponent } from './storebin/storebin.component';
import { SubstoreComponent } from './substore/substore.component';
import { BinConfigComponent } from './bin-config/bin-config.component';
import { HomeComponent } from '../home/home.component';
import { AuthGuard } from '../core/guard/auth.guard';
import { MrnComponent } from './mrn/mrn.component';
import { RollPlanComponent } from './roll-plan/roll-plan.component';
import { FabricinspectionComponent } from './fabricinspection/fabricinspection.component';
/* import { GeneralprComponent } from './generalpr/generalpr.component'; */
import { GenmrnComponent } from './generalpr/genmrn.component';

import { TransferLocationComponent } from './transfer-location/transfer-location.component';
import { BinTransferComponent } from './bin-transfer/bin-transfer.component';
import { GrnComponent } from './grn/grn.component';
import { MaterialTransferInComponent } from './material-transfer-in/material-transfer-in.component';
import { MeterialTransferInHomeComponent } from './material-transfer-in/meterial-transfer-in-home.component';
import {  MeterialTransferInListComponent} from './material-transfer-in/meterial-transfer-in-list/meterial-transfer-in-list.component';

import { TransferOrderComponent } from './transfer-order/transfer-order.component';
import { BinTransferModalComponent } from './bin-transfer/bin-transfer-modal/bin-transfer-modal.component';



const routes: Routes = [
  {path : '' , component : HomeComponent ,children:
    [
      {path : 'substore' , component : SubstoreComponent },
      {path : 'storebin' , component : StorebinComponent },

      {path : 'mrn' , component : MrnComponent, canActivate: [AuthGuard] },
      {path : 'roll-plan' , component : RollPlanComponent },
      {path : 'fabricin-spection' , component : FabricinspectionComponent },
      {path : 'bin-config' , component : BinConfigComponent },
      {path : 'generalpr' , component : GenmrnComponent},
      {path :'transfer-location',component:TransferLocationComponent},
	    {path : 'bin-transfer' , component : BinTransferComponent, canActivate: [AuthGuard] },
      {path : 'grn' , component : GrnComponent, canActivate: [AuthGuard] },
      {path : 'transfer-order' , component : TransferOrderComponent},
      {path:'material-transfer-in',component:MeterialTransferInHomeComponent, canActivate: [AuthGuard] },



    ]},



   {path : 'home' , component : HomeComponent ,children:
      [
        {path : 'mrn' , component : MrnComponent, canActivate: [AuthGuard] },
        /* {path : 'generalpr' , component : GeneralprComponent, canActivate: [AuthGuard]} */


      ]

}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})


export class StoresRoutingModule { }
