import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcategoryPage } from './subcategory-page';

describe('SubcategoryPage', () => {
  let component: SubcategoryPage;
  let fixture: ComponentFixture<SubcategoryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubcategoryPage],
    }).compileComponents();

    fixture = TestBed.createComponent(SubcategoryPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
