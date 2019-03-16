import { Component, OnInit, ViewChild } from '@angular/core';

import { ModalDirective } from 'ngx-bootstrap/modal';
import { TabsetComponent } from 'ngx-bootstrap';

@Component({
  selector: 'app-searching',
  templateUrl: './searching.component.html',
  styleUrls: ['./searching.component.css']
})
export class SearchingComponent implements OnInit {

  @ViewChild('searchingModel') searchingModel: ModalDirective;
  @ViewChild('dataListModel') dataListModel: ModalDirective;

  modelTitle : string = ''
  fields = [
    {
      field : 'merc_customer_order_header.order_id',
      table : 'merc_customer_order_header',
      field_description : 'Order ID',
      query : ''
    },
    {
      field : 'merc_customer_order_header.order_code',
      table : 'merc_customer_order_header',
      field_description : 'Order code',
      query : ''
    },
    {
      field : 'merc_customer_order_header.order_code',
      table : 'merc_customer_order_header',
      field_description : 'Order company',
      foreign_key : 'org_company.company_id',
      query : ''
    },
    {
      field : 'merc_customer_order_header.order_style',
      table : 'merc_customer_order_header',
      field_description : 'Order style',
      query : ''
    }
  ]



  constructor() { }

  ngOnInit() {
  }

  openSearch(){
    this.searchingModel.show()
  }

  showEvent(e){

  }

  loadList(key, field_name){
    this.modelTitle = field_name + ' list'
    this.dataListModel.show()
  }

  addOperator(e, index){

    this.fields[index]['query'] = this.fields[index]['query'] + e.terget.value
  }

}
