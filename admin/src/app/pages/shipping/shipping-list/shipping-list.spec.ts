import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingList } from './shipping-list';

describe('ShippingList', () => {
  let component: ShippingList;
  let fixture: ComponentFixture<ShippingList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingList],
    }).compileComponents();

    fixture = TestBed.createComponent(ShippingList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
