import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderHomeComponent } from './purchase-order-home.component';

describe('PurchaseOrderHomeComponent', () => {
  let component: PurchaseOrderHomeComponent;
  let fixture: ComponentFixture<PurchaseOrderHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseOrderHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseOrderHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
