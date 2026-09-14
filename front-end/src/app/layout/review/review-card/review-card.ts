import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IReview } from '../../../core/models/review.model';

@Component({
  selector: 'app-review-card',
  imports: [CommonModule],
  templateUrl: './review-card.html',
  styleUrl: './review-card.css',
})
export class ReviewCard {
  @Input({ required: true }) review!: IReview;

  getReviewerName(): string {
    if (typeof this.review?.user === 'object' && this.review.user && 'name' in this.review.user) {
      return this.review.user.name || 'Verified Shopper';
    }
    return 'Verified Shopper';
  }

  getReviewerInitial(): string {
    const name = this.getReviewerName();
    return name.charAt(0).toUpperCase() || 'U';
  }
}
