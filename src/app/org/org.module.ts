import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule,ModalModule,TabsModule } from 'ngx-bootstrap';

import { OrgRoutingModule , orgRoutingComponents } from './org-routing.module';


import { CompanyLocationComponent } from './location/company-location.component';
import { CountryComponent } from '../org/country/country.component';
import { SourceComponent } from './location/source.component';
import { ClusterComponent } from './location/cluster.component';
import { CompanyComponent } from './location/company.component';
import { CustomerCreationComponent } from './customer/customer-creation.component';
import { CustomerListComponent } from './customer/customer-list.component';
import { CancellationReasonComponent } from './cancellation/cancellation-reason.component';
import { CancellationCategoryComponent } from './cancellation/cancellation-category.component';
import { StoresComponent } from './stores/stores/stores.component';
import { StoresLocationComponent } from './stores/stores-location/stores-location.component';
import {StoresHomeComponent}  from './stores/stores-home/stores-home.component';
import { SupplierComponent } from './supplier/supplier.component';
import { SupplierListComponent } from './supplier/supplier-list.component';
import { FeatureComponent } from './feature/feature.component';
import { SilhouetteComponent } from './silhouette/silhouette.component';
import { GarmentoptionsComponent } from './garmentoptions/garmentoptions.component';

import { SupplierTolaranceComponent } from './supplier/supplier-tolarance/supplier-tolarance.component';
import{SupplierHomeComponent}from './supplier/supplier-home.component';
import { SilhouetteClassificationComponent } from './silhouette-classification/silhouette-classification.component';
import { ProductSpecificationComponent } from './product-specification/product-specification.component';
/*import { MultiselectComponent } from '../../app/core/components/multiselect/multiselect.component';*/
import { MainLocationComponent } from './location/main-location.component';
import { CoreModule } from '../core';
import { HomeModule } from '../home'
import { RequestTypeComponent } from './request-type/request-type.component';
import { DesignationComponent } from './designation/designation.component';

@NgModule({
  imports: [
    CommonModule,
    OrgRoutingModule,
    HomeModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    CoreModule
  ],
  declarations: [
    orgRoutingComponents,
    CompanyLocationComponent,
    SourceComponent,
    ClusterComponent,
    CompanyComponent,
    CustomerCreationComponent,
    CustomerListComponent,
    CancellationReasonComponent,
    CancellationCategoryComponent,



  ProductSpecificationComponent,
  SilhouetteClassificationComponent,
    StoresComponent,
    StoresLocationComponent,
    StoresHomeComponent,
    SupplierComponent,
    SupplierListComponent,
    SupplierHomeComponent,
    SupplierTolaranceComponent,
    /*MultiselectComponent,*/
    MainLocationComponent,
    orgRoutingComponents,
    FeatureComponent,
    SilhouetteComponent,
    GarmentoptionsComponent,
    RequestTypeComponent,
    DesignationComponent
  ],
  exports : [
    CompanyLocationComponent,
    CountryComponent,
    SupplierHomeComponent
  ]
})
export class OrgModule { }
