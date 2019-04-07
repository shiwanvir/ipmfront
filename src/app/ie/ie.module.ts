import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';

// import { IeRoutingModule } from './ie-routing.module';
import { ModalModule,TabsModule } from 'ngx-bootstrap';
import { IeRoutingModule , ieRoutingComponents } from './ie-routing.module';

import { SmvupdateComponent } from '../ie/smvupdate/smvupdate.component';

import { SmvupdateHistoryComponent } from '../ie/smvupdate/smvupdate-history.component';
import { SmvupdateCostingComponent } from './smvupdate-costing/smvupdate-costing.component';
import { ServiceTypesComponent } from './service-types/service-types.component';

import { HomeModule } from '../home';
import { GarmentOperationMasterComponent } from './garment-operation-master/garment-operation-master.component';

@NgModule({
  imports: [
    CommonModule,
    IeRoutingModule,
    ModalModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    TabsModule,
    HomeModule
  ],
  declarations: [
    SmvupdateComponent,
    ieRoutingComponents,
    SmvupdateHistoryComponent,
    SmvupdateCostingComponent,
    ServiceTypesComponent,
    GarmentOperationMasterComponent

  ]
})
export class IeModule { }
