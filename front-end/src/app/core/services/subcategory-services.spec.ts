import { TestBed } from '@angular/core/testing';

import { SubcategoryServices } from './subcategory-services';

describe('SubcategoryServices', () => {
  let service: SubcategoryServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubcategoryServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
