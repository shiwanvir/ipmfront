import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { ModalModule } from 'ngx-bootstrap';
import { BsDatepickerModule,ModalModule,TabsModule } from 'ngx-bootstrap';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';

import { StoresRoutingModule } from './stores-routing.module';
import { GeneralprComponent } from './generalpr/generalpr.component';
import { HomeModule } from '../home';
import { CoreModule } from '../core';

import { NgSelectModule } from '@ng-select/ng-select';
import { MrnComponent } from './mrn/mrn.component';
import { StorebinComponent } from './storebin/storebin.component';
import { SubstoreComponent } from './substore/substore.component';
import { HotTableModule } from '@handsontable/angular';

import { RollPlanComponent } from './roll-plan/roll-plan.component';
import { FabricinspectionComponent } from './fabricinspection/fabricinspection.component';


import { BinConfigComponent } from './bin-config/bin-config.component';
import { GenmrnComponent } from './generalpr/genmrn.component';
import { GenmrnListComponent } from './generalpr/genmrn-list.component';
import { LengthAuditComponent } from './length-audit/length-audit.component';
import { InspectionSummeryLogComponent } from './inspection-summery-log/inspection-summery-log.component';
import { TransferOrderComponent } from './transfer-order/transfer-order.component';
import { BinTransferModalComponent } from './bin-transfer/bin-transfer-modal/bin-transfer-modal.component';
import { BinTransferComponent } from './bin-transfer/bin-transfer.component';
import { GrnModalComponent } from './grn/grn-modal/grn-modal.component';
import { GrnBinComponent } from './grn/grn-bin/grn-bin.component';
import { GrnComponent } from './grn/grn.component';
import { MaterialTransferInComponent } from './material-transfer-in/material-transfer-in.component';
import { TransferLocationComponent } from './transfer-location/transfer-location.component';

import { MrnTestComponent } from './mrn-test/mrn-test.component';
import { MeterialTransferInListComponent } from './material-transfer-in/meterial-transfer-in-list/meterial-transfer-in-list.component';
// import { MaterialTransferInComponent } from './material-transfer-in/material-transfer-in.component';
import { MeterialTransferInHomeComponent } from './material-transfer-in/meterial-transfer-in-home.component';


@NgModule({
  imports: [
    CommonModule,
    StoresRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HomeModule,
	ModalModule ,
	BsDatepickerModule,
	BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
	TabsModule.forRoot(),
	  CoreModule,
	  FormsModule,
    NgSelectModule,
      HotTableModule.forRoot()
  ],

  declarations: [MrnComponent,
    StorebinComponent,
    SubstoreComponent,
    BinConfigComponent,
    GenmrnComponent,
    GeneralprComponent,
    GenmrnListComponent,
    RollPlanComponent,
    FabricinspectionComponent,
    TransferLocationComponent,
    BinTransferComponent,
    BinTransferModalComponent,
    GrnComponent,
    GrnModalComponent,
    GrnBinComponent,
    MrnTestComponent,
    LengthAuditComponent,
    InspectionSummeryLogComponent,
    TransferOrderComponent,
    MaterialTransferInComponent,
    MeterialTransferInListComponent,
     MeterialTransferInHomeComponent



    // MaterialTransferInComponent
    ],

  exports : [StorebinComponent]
})
export class StoresModule { }
