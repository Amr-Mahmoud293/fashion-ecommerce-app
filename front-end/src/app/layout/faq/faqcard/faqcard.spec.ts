import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Faqcard } from './faqcard';

describe('Faqcard', () => {
  let component: Faqcard;
  let fixture: ComponentFixture<Faqcard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Faqcard],
    }).compileComponents();

    fixture = TestBed.createComponent(Faqcard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
