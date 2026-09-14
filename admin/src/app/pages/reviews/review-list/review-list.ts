import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IReview } from '../../../core/models/review.model';

@Component({
  selector: 'app-review-list',
  imports: [CommonModule],
  templateUrl: './review-list.html',
  styleUrl: './review-list.css',
})
export class ReviewList implements OnChanges {
  @Input({ required: true }) reviews: IReview[] = [];
  @Input() total = 0;
  @Input() page = 1;
  @Input() limit = 10;
  @Input() totalPages = 1;
  @Input() isLoading = false;

  @Output() toggleApproval = new EventEmitter<{ review: IReview; isApproved: boolean }>();
  @Output() deleteReview = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();

  pages: number[] = [];
  selectedReview: IReview | null = null;

  ngOnChanges(): void {
    this.updatePages();
  }

  getUserName(review: IReview): string {
    if (typeof review.user === 'object' && review.user && 'name' in review.user) {
      return review.user.name || 'Anonymous Customer';
    }
    return 'Customer';
  }

  getUserEmail(review: IReview): string {
    if (typeof review.user === 'object' && review.user && 'email' in review.user) {
      return review.user.email || 'No email provided';
    }
    return 'N/A';
  }

  getUserInitial(review: IReview): string {
    return this.getUserName(review).charAt(0).toUpperCase() || 'U';
  }

  getStars(): number[] {
    return [1, 2, 3, 4, 5];
  }

  onToggleApproval(review: IReview): void {
    const nextStatus = !review.isApproved;
    this.toggleApproval.emit({ review, isApproved: nextStatus });
    if (this.selectedReview && this.selectedReview._id === review._id) {
      this.selectedReview.isApproved = nextStatus;
    }
  }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this customer review?')) {
      if (this.selectedReview?._id === id) {
        this.selectedReview = null;
      }
      this.deleteReview.emit(id);
    }
  }

  onOpenModal(review: IReview): void {
    this.selectedReview = review;
  }

  onCloseModal(): void {
    this.selectedReview = null;
  }

  onPageSelect(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages && newPage !== this.page) {
      this.pageChange.emit(newPage);
    }
  }

  private updatePages(): void {
    const total = this.totalPages || 1;
    const current = this.page || 1;
    const maxVisible = 5;

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    this.pages = [];
    for (let i = start; i <= end; i++) {
      this.pages.push(i);
    }
  }
}
