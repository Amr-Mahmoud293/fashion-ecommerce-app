import { TestBed } from '@angular/core/testing';

import { FaqServices } from './faq-services';

describe('FaqServices', () => {
  let service: FaqServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FaqServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
