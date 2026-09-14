import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingPage } from './shipping-page';

describe('ShippingPage', () => {
  let component: ShippingPage;
  let fixture: ComponentFixture<ShippingPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ShippingPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
