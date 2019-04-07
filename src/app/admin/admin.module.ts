import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule,ModalModule,TabsModule } from 'ngx-bootstrap';

import { ReactiveFormsModule , FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { UserComponent } from './user/user.component';
import { RegisterComponent } from './register/register.component';

import { CoreModule } from '../core';
import { NgSelectModule } from '@ng-select/ng-select';
import { HomeModule } from '../home';
import { RoleComponent } from './role/role/role.component';
import { RoleHomeComponent } from './role/role-home/role-home.component';
import { RoleListComponent } from './role/role-list/role-list.component';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    HomeModule,
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TabsModule.forRoot(),
    CoreModule,
    NgSelectModule
  ],
  declarations: [
    UserComponent,
    RegisterComponent,
    RoleComponent,
    RoleHomeComponent,
    RoleListComponent
  ],
  exports : [UserComponent]
})
export class AdminModule { }
