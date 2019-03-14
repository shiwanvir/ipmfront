import { Component, OnInit , ViewChild , AfterViewInit  } from '@angular/core';
import { TabsetComponent,TabDirective} from 'ngx-bootstrap';
import { ActivatedRoute } from '@angular/router';

import {PaymentTermComponent} from "../payment-term/payment-term.component";
import {CostCenterComponent}  from"../cost-center/cost-center.component";
import {PaymentMethodComponent} from "../payment-method/payment-method.component";

@Component({
  selector: 'app-accounting-rules',
  templateUrl: './accounting-rules.component.html',
  styleUrls: ['./accounting-rules.component.css']
})
export class AccountingRulesComponent implements OnInit {

  @ViewChild('financeTabs') financeTabs: TabsetComponent;
  @ViewChild(PaymentTermComponent) childPaymentTerm: PaymentTermComponent;
  @ViewChild(CostCenterComponent) childCostCenter: CostCenterComponent;
  @ViewChild(PaymentMethodComponent) childPaymentMethod: PaymentMethodComponent;

    constructor(private router: ActivatedRoute) { }


    ngOnInit() {
      this.router.data
      .subscribe(res => {
          if(res.tabName == 'PAYMENTTERM'){
            this.financeTabs.tabs[0].active = true;
            this.childPaymentTerm.createTable()
          }
          else if(res.tabName == 'COSTCENTER'){
            this.financeTabs.tabs[1].active = true;
            this.childCostCenter.createTable()
          }
          else if(res.tabName == 'PAYMENTMETHOD'){
            this.financeTabs.tabs[2].active = true;
            this.childPaymentMethod.createTable()
          }

      });
    }


    onSelect(data: TabDirective): void {
      switch(data.heading){
        case 'Payment Term' :
          if(this.childPaymentTerm.datatable == null){
              this.childPaymentTerm.createTable()
          }
          break;
        case 'Cost Center' :
          if(this.childCostCenter.datatable == null){
              this.childCostCenter.createTable()
          }
          break;
        case 'Payment Method' :
          if(this.childPaymentMethod.datatable == null){
              this.childPaymentMethod.createTable()
          }
          break;

      }
    }

}
