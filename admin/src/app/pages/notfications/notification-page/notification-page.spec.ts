import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationPage } from './notification-page';

describe('NotificationPage', () => {
  let component: NotificationPage;
  let fixture: ComponentFixture<NotificationPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationPage],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
