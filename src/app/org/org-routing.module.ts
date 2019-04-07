import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CountryComponent } from '../org/country/country.component';
import { LocationComponent } from '../org/location/location.component';
import { DepartmentComponent } from '../org/department/department.component';
import { DivisionComponent } from '../org/division/division.component';
import { SeasonComponent } from '../org/season/season.component';
import { UomComponent } from '../org/uom/uom.component';
import { SectionComponent } from '../org/section/section.component';
import { OriginTypeComponent } from '../org/origin-type/origin-type.component';
import { CurrencyComponent } from '../org/currency/currency.component';
import { CustomerComponent } from '../org/customer/customer.component';
import { CancellationComponent } from '../org/cancellation/cancellation.component';
import { ProductSpecificationComponent } from './product-specification/product-specification.component';
import { SilhouetteClassificationComponent } from './silhouette-classification/silhouette-classification.component';
import{SupplierComponent}from '../org/supplier/supplier.component';
import{SupplierListComponent}from '../org/supplier/supplier-list.component';
import{SupplierHomeComponent}from '../org/supplier/supplier-home.component';
import{SupplierTolaranceComponent }from '../org/supplier/supplier-tolarance/supplier-tolarance.component';
import { SizeComponent } from '../org/size/size.component';
import { ColorComponent } from '../org/color/color.component';
import { StoresComponent } from '../org/stores/stores/stores.component';
import { FeatureComponent } from '../org/feature/feature.component';
import { SilhouetteComponent } from '../org/silhouette/silhouette.component';
import { GarmentoptionsComponent } from '../org/garmentoptions/garmentoptions.component';
import { RequestTypeComponent } from './request-type/request-type.component';
import { DesignationComponent } from './designation/designation.component';





import { HomeComponent } from '../home/home.component';

import { AuthGuard } from '../core/guard/auth.guard';
import { PermissionGuard } from '../core/guard/permission.guard';


const routes: Routes = [
  //{path : 'location' , component : LocationComponent,outlet:'login'},
    {path : '' , component : HomeComponent ,children:
      [
        {path : 'source' , component : LocationComponent, data : {tabName : 'SOURCE'} , canActivate: [AuthGuard]}, //, canActivate: [AuthGuard]
        {path : 'cluster' , component : LocationComponent, data : {tabName : 'CLUSTER'} , canActivate: [AuthGuard]},
        {path : 'company' , component : LocationComponent, data : {tabName : 'COMPANY'} , canActivate: [AuthGuard]},
        {path : 'location' , component : LocationComponent, data : {tabName : 'LOCATION'} , canActivate: [AuthGuard]},
        {path : 'customer' , component : CustomerComponent, canActivate: [AuthGuard] },
        {path : 'department' , component : DepartmentComponent , canActivate: [AuthGuard]},
        {path : 'division' , component: DivisionComponent , canActivate: [AuthGuard]},
        {path : 'season' , component : SeasonComponent , canActivate: [AuthGuard]},
        {path : 'uom' , component : UomComponent , canActivate: [AuthGuard]},
        {path : 'section' , component : SectionComponent ,canActivate: [AuthGuard]},
        {path : 'origin-type' , component : OriginTypeComponent , canActivate: [AuthGuard]},
        {path : 'currency' , component : CurrencyComponent , canActivate: [AuthGuard]},
        {path : 'country' , component : CountryComponent , canActivate: [AuthGuard]},
        {path:'product-specification',component :ProductSpecificationComponent, canActivate: [AuthGuard]},
        {path:'silhouette-classification',component :SilhouetteClassificationComponent, canActivate: [AuthGuard]},
        {path : 'size' , component : SizeComponent , canActivate: [AuthGuard]},
        {path : 'color' , component : ColorComponent , canActivate: [AuthGuard, PermissionGuard], data : {permission : 'AAA'}},
        {path : 'stores' , component : StoresComponent , canActivate: [AuthGuard]},
        {path : 'supplier' , component : SupplierHomeComponent , canActivate: [AuthGuard]},
        {path : 'cancellation-reason' , component : CancellationComponent, data : {tabName : 'CANCELLATIONREASON'} , canActivate: [AuthGuard]},
        {path : 'cancellation-category' , component : CancellationComponent, data : {tabName : 'CANCELLATIONCATEGORY'} , canActivate: [AuthGuard]},
        {path : 'feature' , component : FeatureComponent},
        {path : 'silhouette' , component : SilhouetteComponent,canActivate: [AuthGuard]},
        {path : 'garmentoptions' , component : GarmentoptionsComponent, canActivate: [AuthGuard]},
        {path : 'request-type' , component : RequestTypeComponent, canActivate: [AuthGuard]},
        {path:'designation',component:DesignationComponent,canActivate:[AuthGuard]}

      ]
    },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrgRoutingModule { }

export const orgRoutingComponents = [
  LocationComponent,
  CountryComponent,
  DepartmentComponent,
  DivisionComponent,
  SeasonComponent,
  UomComponent,
  SectionComponent,
  OriginTypeComponent,
  CurrencyComponent,
  CustomerComponent,
  CancellationComponent,
  ProductSpecificationComponent,
  SilhouetteClassificationComponent,
  SupplierComponent,
  SupplierListComponent,
  SizeComponent,
  ColorComponent,
  //StoresHomeComponent,
  StoresComponent,
  SupplierHomeComponent,
  FeatureComponent,
  SilhouetteComponent,
  GarmentoptionsComponent,
  RequestTypeComponent
]
