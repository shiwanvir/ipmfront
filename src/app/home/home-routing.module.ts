import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home.component';
import { LoginComponent } from './login/login.component';

import { AuthGuard } from '../core/guard/auth.guard';

const routes: Routes = [
  { path : '', component : HomeComponent , canActivate: [AuthGuard] },
  { path : 'login' , component : LoginComponent },
  { path : 'home', component: HomeComponent, canActivate: [AuthGuard]},
  { path : 'admin' , loadChildren : '../admin/admin.module#AdminModule' },
  { path : 'org' , loadChildren : '../org/org.module#OrgModule' },
  { path : 'finance' , loadChildren : '../finance/finance.module#FinanceModule' },
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
