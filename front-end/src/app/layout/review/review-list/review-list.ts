import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ReviewServices } from '../../../core/services/review-services';
import { IReview } from '../../../core/models/review.model';
import { ReviewCard } from '../review-card/review-card';

@Component({
  selector: 'app-review-list',
  imports: [CommonModule, ReviewCard],
  templateUrl: './review-list.html',
  styleUrl: './review-list.css',
})
export class ReviewList implements OnInit, OnDestroy {
  private reviewService = inject(ReviewServices);
  private cdr = inject(ChangeDetectorRef);
  private subscriptions = new Subscription();

  @Input() reviews: IReview[] = [];
  @Input() title = 'What Our Shoppers Say';
  @Input() tag = 'Customer Feedback';
  @Input() showHeader = true;

  isLoading = false;

  ngOnInit(): void {
    if (!this.reviews || this.reviews.length === 0) {
      this.loadActiveReviews();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadActiveReviews(): void {
    this.isLoading = true;
    const sub = this.reviewService.getActiveReviews({ limit: 6 }).subscribe({
      next: (res) => {
        this.reviews = res.results || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load active reviews:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
    this.subscriptions.add(sub);
  }

  getAverageRating(): string {
    if (!this.reviews || this.reviews.length === 0) return '5.0';
    const sum = this.reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / this.reviews.length).toFixed(1);
  }
}
