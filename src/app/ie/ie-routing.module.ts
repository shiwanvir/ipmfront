import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SmvupdateHomeComponent } from '../ie/smvupdate/smvupdate-home.component';
import { SmvupdateCostingComponent } from './smvupdate-costing/smvupdate-costing.component';
import { ServiceTypesComponent } from './service-types/service-types.component';
import { GarmentOperationMasterComponent } from './garment-operation-master/garment-operation-master.component';


import { HomeComponent } from '../home/home.component';
import { AuthGuard } from '../core/guard/auth.guard';;
//const routes: Routes = [];

const routes: Routes = [
  //{path : 'location' , component : LocationComponent,outlet:'login'},
    {path : '' , component : HomeComponent ,children:
      [
        {path : 'smvupdate' , component : SmvupdateHomeComponent, canActivate: [AuthGuard] },
        {path : 'smvupdate-costing' , component : SmvupdateCostingComponent, canActivate: [AuthGuard] },
        {path : 'service-types' , component : ServiceTypesComponent, canActivate: [AuthGuard] },
        {path:'gramemt-operation-master',component:GarmentOperationMasterComponent,canActivate:[AuthGuard]}
      ]

}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IeRoutingModule { }

export const ieRoutingComponents =[

    SmvupdateHomeComponent,
    SmvupdateCostingComponent,
    ServiceTypesComponent,
    GarmentOperationMasterComponent

]
