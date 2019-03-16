import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ItemgroupComponent } from '../itemcreation/itemgroup/itemgroup.component';
import { SubcategoryComponent } from '../itemcreation/subcategory/subcategory.component';
import { AssignpropertiesComponent } from '../itemcreation/assignproperties/assignproperties.component';
import { ItemcreationwizardComponent } from '../itemcreation/itemcreationwizard/itemcreationwizard.component';
import { ItemlistingComponent } from '../itemcreation/itemlisting/itemlisting.component';

import { HomeComponent } from '../home/home.component';

import { AuthGuard } from '../core/guard/auth.guard';


const routes: Routes = [
  //{path : 'location' , component : LocationComponent,outlet:'login'},
    {path : '' , component : HomeComponent ,children:
      [
        {path : 'itemgroup', component:ItemgroupComponent},
        {path : 'subcategory' , component : SubcategoryComponent }, //, canActivate: [AuthGuard]
        {path : 'assignproperty', component : AssignpropertiesComponent},
        {path : 'itemcreationwizard', component : ItemcreationwizardComponent},
        {path : 'itemlisting', component : ItemlistingComponent}
      ]
    },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItemcreationRoutingModule { }

export const ItemcreationRoutingComponents = [
  SubcategoryComponent,
  AssignpropertiesComponent,
  ItemcreationwizardComponent
]
