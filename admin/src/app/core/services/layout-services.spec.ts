import { TestBed } from '@angular/core/testing';

import { LayoutServices } from './layout-services';

describe('LayoutServices', () => {
  let service: LayoutServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayoutServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
