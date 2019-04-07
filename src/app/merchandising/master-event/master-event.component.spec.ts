import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterEventComponent } from './master-event.component';

describe('MasterEventComponent', () => {
  let component: MasterEventComponent;
  let fixture: ComponentFixture<MasterEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MasterEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
