import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountingRulesComponent } from '../finance/accounting-rules/accounting-rules.component';
import { PaymentMethodComponent } from '../finance/payment-method/payment-method.component';
import { PaymentTermComponent } from '../finance/payment-term/payment-term.component';
import { CostCenterComponent } from '../finance/cost-center/cost-center.component';
import { ItemFabricComponent } from '../finance/item-fabric/item-fabric.component';
import { GoodsTypeComponent } from '../finance/goods-type/goods-type.component';
import { ShipmentTermComponent } from './shipment-term/shipment-term.component';
import { TarnsactionComponent } from './tarnsaction/tarnsaction.component';
import { ExchangeRateComponent } from './exchange-rate/exchange-rate.component';
import { CostComponent } from './cost/cost.component';


import { HomeComponent } from '../home/home.component';
import { AuthGuard } from '../core/guard/auth.guard';

const routes: Routes = [
  {path : '' , component : HomeComponent ,children:
    [
      {path : 'accounting-rules' , component : AccountingRulesComponent },
      {path : 'payment-method' , component : AccountingRulesComponent,data : {tabName : 'PAYMENTMETHOD'} , canActivate: [AuthGuard]},
      {path : 'payment-term' , component : AccountingRulesComponent,data : {tabName : 'PAYMENTTERM'} , canActivate: [AuthGuard]},
      {path : 'cost-center' , component : AccountingRulesComponent,data : {tabName : 'COSTCENTER'} , canActivate: [AuthGuard]},
      {path : 'item/fabric' , component : ItemFabricComponent},
      {path : 'goods-type' , component : GoodsTypeComponent},
      {path : 'shipment-term' , component : ShipmentTermComponent},
      {path : 'fin-transaction' , component : TarnsactionComponent},
      {path : 'exchange-rate' , component : ExchangeRateComponent},
      {path : 'finance-cost' , component : CostComponent}

    ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinanceRoutingModule { }

export const financeRoutingComponents = [
  AccountingRulesComponent ,
  PaymentMethodComponent ,
  PaymentTermComponent ,
  CostCenterComponent,
  ItemFabricComponent,
  GoodsTypeComponent,
  ShipmentTermComponent,
  TarnsactionComponent,
  ExchangeRateComponent
];
