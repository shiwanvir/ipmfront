import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StyleCreationComponent } from './style-creation/style-creation.component';
import { CustomerSizeGridComponent } from './customer-size-grid/customer-size-grid.component';
import { ColorOptionsComponent}from'./color-options/color-options.component';
import { CutDirectionComponent}from'./cut-direction/cut-direction.component';
import { StyleBuyerPoHomeComponent } from './style-buyer-po/style-buyer-po-home.component';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { PositionComponent } from './position/position.component';
import { HomeComponent } from '../home/home.component';
import { BomStageComponent } from './bom-stage/bom-stage.component';
import { RoundComponent } from './round/round.component';
import { TnaComponent } from './tna/tna.component';
import { MasterEventComponent } from './master-event/master-event.component';
import { MaterialSizeComponent } from './material-size/material-size.component';

// import { HomeComponent } from '../home/home.component';

import { AuthGuard } from '../core/guard/auth.guard';
import { FlashComponent } from './costing/flash/flash.component';
import { BulkComponent } from './costing/bulk/bulk.component';
import { BomComponent } from './bom/bom.component';

import { PurchaseRequisitionLinesComponent } from './purchase-requisition-lines/purchase-requisition-lines.component';

const routes: Routes = [
  {path : '' , component : HomeComponent ,children:
    [
      {path : 'purchase-requisition-lines' , component : PurchaseRequisitionLinesComponent , canActivate: [AuthGuard] },
      {path : 'style-creation' , component : StyleCreationComponent , canActivate: [AuthGuard] },
      {path : 'style-buyer-po' , component : StyleBuyerPoHomeComponent , canActivate: [AuthGuard] },
      {path : 'purchase-order' , component : PurchaseOrderComponent , canActivate: [AuthGuard] },
      {path : 'bom-stage' , component : BomStageComponent , canActivate: [AuthGuard] },
      {path : 'round' , component : RoundComponent , canActivate: [AuthGuard] },
      {path : 'customer-size-grid' , component : CustomerSizeGridComponent},
      {path : 'color-options' , component : ColorOptionsComponent},
      {path : 'cut-direction',component:CutDirectionComponent},
      {path : 'tna' , component : TnaComponent },
      {path : 'tna-master' , component : MasterEventComponent },
      {path : 'flashcosting' , component : FlashComponent },
      {path:'position',component:PositionComponent},
      {path : 'bulk' , component : BulkComponent },
      {path : 'material-size' , component : MaterialSizeComponent },
      {path : 'bom' , component : BomComponent }


    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MerchandisingRoutingModule { }

export const MerchandisingRoutingModuleComponents = [
  StyleCreationComponent,
  StyleBuyerPoHomeComponent,  
  PurchaseOrderComponent
  //BomStageComponent,
  //RoundComponent
  //StyleBuyerPoComponent,
  /*FlashComponent,*/
];
