import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegisterComponent } from '../admin/register/register.component';
import { UserComponent } from '../admin/user/user.component';
import { RoleHomeComponent } from './role/role-home/role-home.component';
import { HomeComponent } from '../home/home.component';

const routes: Routes = [
  {path : '' , component : HomeComponent ,children:
    [
      {path : 'user' , component : RegisterComponent },
      {path : 'user/:id' , component : RegisterComponent },
      {path : 'users' , component : UserComponent },
      {path : 'role', component : RoleHomeComponent }
    ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }

export const AdminRoutingComponents = [
  RoleHomeComponent
]

/*
export const financeRoutingComponents = [
  UserComponent


];*/
