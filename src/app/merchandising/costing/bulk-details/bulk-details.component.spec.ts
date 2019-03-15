import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkDetailsComponent } from './bulk-details.component';

describe('BulkDetailsComponent', () => {
  let component: BulkDetailsComponent;
  let fixture: ComponentFixture<BulkDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
