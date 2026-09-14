import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewServices } from '../../../core/services/review-services';
import { IReview } from '../../../core/models/review.model';
import { ReviewList } from '../review-list/review-list';

@Component({
  selector: 'app-review-page',
  imports: [CommonModule, FormsModule, ReviewList],
  templateUrl: './review-page.html',
  styleUrl: './review-page.css',
})
export class ReviewPage implements OnInit {
  private reviewService = inject(ReviewServices);

  reviews = signal<IReview[]>([]);
  total = signal<number>(0);
  page = signal<number>(1);
  limit = signal<number>(10);
  totalPages = signal<number>(1);

  isLoading = signal<boolean>(false);
  searchQuery = signal<string>('');
  statusFilter = signal<'all' | 'approved' | 'pending'>('all');
  ratingFilter = signal<number>(0);
  feedback = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  // Statistics Computed
  stats = computed(() => {
    const list = this.reviews();
    const totalCount = this.total();
    const approvedCount = list.filter((r) => r.isApproved).length;
    const pendingCount = list.filter((r) => !r.isApproved).length;

    let avgRating = 0;
    if (list.length > 0) {
      const sum = list.reduce((acc, r) => acc + (r.rating || 0), 0);
      avgRating = Number((sum / list.length).toFixed(1));
    }

    return {
      totalCount,
      approvedCount,
      pendingCount,
      avgRating,
    };
  });

  // Filtered Reviews for table
  filteredReviews = computed(() => {
    let list = this.reviews();
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    const rating = Number(this.ratingFilter());

    if (query) {
      list = list.filter((r) => {
        const userName =
          typeof r.user === 'object' && r.user && 'name' in r.user
            ? (r.user.name || '').toLowerCase()
            : '';
        const userEmail =
          typeof r.user === 'object' && r.user && 'email' in r.user
            ? (r.user.email || '').toLowerCase()
            : '';
        const comment = (r.comment || '').toLowerCase();
        return (
          userName.includes(query) ||
          userEmail.includes(query) ||
          comment.includes(query)
        );
      });
    }

    if (status === 'approved') {
      list = list.filter((r) => r.isApproved);
    } else if (status === 'pending') {
      list = list.filter((r) => !r.isApproved);
    }

    if (rating > 0) {
      list = list.filter((r) => r.rating === rating);
    }

    return list;
  });

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading.set(true);
    this.reviewService
      .getAllReviews({
        page: this.page(),
        limit: this.limit(),
        sort: 'createdAt',
        order: 'desc',
      })
      .subscribe({
        next: (res) => {
          this.reviews.set(res.results || []);
          this.total.set(res.total || 0);
          this.totalPages.set(res.totalPages || 1);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.showFeedback(
            'error',
            err.error?.message || 'Failed to load reviews from server.'
          );
          this.isLoading.set(false);
        },
      });
  }

  onToggleApproval(event: { review: IReview; isApproved: boolean }): void {
    const { review, isApproved } = event;
    const actionText = isApproved ? 'approved' : 'marked as pending';

    this.reviewService.updateReviewStatus(review._id, isApproved).subscribe({
      next: (res) => {
        // Optimistically update the item in the signal
        this.reviews.update((items) =>
          items.map((item) =>
            item._id === review._id ? { ...item, isApproved } : item
          )
        );
        this.showFeedback('success', `Review has been ${actionText} successfully.`);
      },
      error: (err) => {
        this.showFeedback(
          'error',
          err.error?.message || 'Failed to update review status.'
        );
      },
    });
  }

  onDeleteReview(id: string): void {
    this.reviewService.deleteReview(id).subscribe({
      next: () => {
        this.showFeedback('success', 'Review deleted successfully.');
        this.loadReviews();
      },
      error: (err) => {
        this.showFeedback(
          'error',
          err.error?.message || 'Failed to delete review.'
        );
      },
    });
  }

  onPageChange(newPage: number): void {
    this.page.set(newPage);
    this.loadReviews();
  }

  onResetFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('all');
    this.ratingFilter.set(0);
  }

  private showFeedback(type: 'success' | 'error', text: string): void {
    this.feedback.set({ type, text });
    setTimeout(() => {
      this.feedback.set(null);
    }, 4000);
  }
}
