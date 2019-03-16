import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';
<<<<<<< HEAD
=======
//import { SnotifyModule, SnotifyService, ToastDefaults } from 'ng-snotify';
>>>>>>> 4dee6d899bba6667fefe4fd4acef658e2b904258

import { HotTableModule } from '@handsontable/angular';
import { BsDatepickerModule,ModalModule,TabsModule } from 'ngx-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { SnotifyModule, SnotifyService, ToastDefaults } from 'ng-snotify';
<<<<<<< HEAD
=======
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { QueryBuilderModule } from "angular2-query-builder";
>>>>>>> 4dee6d899bba6667fefe4fd4acef658e2b904258

import { MerchandisingRoutingModule , MerchandisingRoutingModuleComponents } from './merchandising-routing.module';
import { KeysPipe } from './pips/keys.pipe';

import { TnaComponent } from './tna/tna.component';
import { MasterEventComponent } from './master-event/master-event.component';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { StyleBuyerPoComponent } from './style-buyer-po/style-buyer-po.component';
import { StyleBuyerPoListComponent } from './style-buyer-po/style-buyer-po-list.component';
import { StyleBuyerPoHomeComponent } from './style-buyer-po/style-buyer-po-home.component';
import { CustomerSizeGridComponent } from './customer-size-grid/customer-size-grid.component';
import { ColorOptionsComponent } from './color-options/color-options.component';
import { CutDirectionComponent } from './cut-direction/cut-direction.component';
import { BomStageComponent } from './bom-stage/bom-stage.component';
import { RoundComponent } from './round/round.component';
import { StyleCreationComponent } from './style-creation/style-creation.component';
<<<<<<< HEAD
=======
import { FlashComponent } from './costing/flash/flash.component';
import { BulkComponent } from './costing/bulk/bulk.component';
import { BulkDetailsComponent } from './costing/bulk-details/bulk-details.component';

>>>>>>> 4dee6d899bba6667fefe4fd4acef658e2b904258

import { BuyerPoSizeComponent } from './style-buyer-po/buyer-po-size/buyer-po-size.component';
import { PoSplitComponent } from './style-buyer-po/po-split/po-split.component';
import { PoRevisionComponent } from './style-buyer-po/po-revision/po-revision.component';
//import { FlashComponent } from './costing/flash/flash.component';
import { PositionComponent } from './position/position.component';
<<<<<<< HEAD
import { BulkComponent } from './costing/bulk/bulk.component';
=======
//import { BulkComponent } from './costing/bulk/bulk.component';
import { BomComponent } from './bom/bom.component';
>>>>>>> 4dee6d899bba6667fefe4fd4acef658e2b904258

import { HomeModule } from '../home';
import { CostingModule } from './costing/costing.module';
import { SearchingComponent } from './searching/searching.component';
import { MaterialSizeComponent } from './material-size/material-size.component';
import { PurchaseOrderListComponent } from './purchase-order/purchase-order-list/purchase-order-list.component';
import { PurchaseOrderHomeComponent } from './purchase-order/purchase-order-home/purchase-order-home.component';
import { PurchaseRequisitionLinesComponent } from './purchase-requisition-lines/purchase-requisition-lines.component';
import { PrlListComponent } from './purchase-requisition-lines/prl-list/prl-list.component';
<<<<<<< HEAD
import { BomComponent } from './bom/bom.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
=======
import { PrlHomeComponent } from './purchase-requisition-lines/prl-home/prl-home.component';
>>>>>>> 4dee6d899bba6667fefe4fd4acef658e2b904258


@NgModule({
  imports: [
    CommonModule,
    HomeModule,
    MerchandisingRoutingModule,
    HotTableModule.forRoot(),
    ReactiveFormsModule,
    NgSelectModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    SnotifyModule,
    CostingModule,
    FormsModule,
<<<<<<< HEAD
    NgMultiSelectDropDownModule.forRoot()
=======
    NgMultiSelectDropDownModule.forRoot(),
    QueryBuilderModule,
>>>>>>> 4dee6d899bba6667fefe4fd4acef658e2b904258
  ],
 //declarations: [StyleCreationComponent,KeysPipe, TnaComponent, MasterEventComponent, FlashComponent],
 // declarations: [StyleCreationComponent, TnaComponent, MasterEventComponent],

  // declarations: [StyleCreationComponent, StyleBuyerPoComponent, TnaComponent],
 declarations: [
   MerchandisingRoutingModuleComponents,
   StyleBuyerPoComponent,
   KeysPipe,
   TnaComponent,
   MasterEventComponent,
   PurchaseOrderComponent,
   StyleBuyerPoListComponent,
   StyleCreationComponent,
   CustomerSizeGridComponent,
   ColorOptionsComponent,
   CutDirectionComponent,
   StyleCreationComponent,
   BomStageComponent,
   RoundComponent,
<<<<<<< HEAD
   // FlashComponent,
   StyleBuyerPoHomeComponent,
   BulkComponent,
=======
   //FlashComponent,
   BulkComponent,
   BulkDetailsComponent,
   StyleBuyerPoHomeComponent,
>>>>>>> 4dee6d899bba6667fefe4fd4acef658e2b904258
   BuyerPoSizeComponent,
   PoSplitComponent,
   PoRevisionComponent,
   PositionComponent,
   SearchingComponent,
   PurchaseOrderListComponent,
   PurchaseOrderHomeComponent,
   PurchaseRequisitionLinesComponent,
   PrlListComponent,
<<<<<<< HEAD
   MaterialSizeComponent,
   BomComponent,
=======
   PrlHomeComponent,
   MaterialSizeComponent,
   BomComponent
>>>>>>> 4dee6d899bba6667fefe4fd4acef658e2b904258
 ],

  providers : [
    { provide: 'SnotifyToastConfig', useValue: ToastDefaults},
    SnotifyService
  ],
  exports : [/*StyleCreationComponent*/]
})
export class MerchandisingModule { }
