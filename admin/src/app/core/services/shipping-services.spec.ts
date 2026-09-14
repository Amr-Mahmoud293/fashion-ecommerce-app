import { TestBed } from '@angular/core/testing';

import { ShippingServices } from './shipping-services';

describe('ShippingServices', () => {
  let service: ShippingServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShippingServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
