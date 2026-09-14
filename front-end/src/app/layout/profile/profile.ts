import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserServices } from '../../core/services/user-services';
import { OrderServices } from '../../core/services/order-services';
import { AuthServices } from '../../core/services/auth-services';
import { ReviewServices } from '../../core/services/review-services';
import { IUser } from '../../core/models/user.model';
import { IOrder, IOrderProduct } from '../../core/models/order.model';
import { IReview } from '../../core/models/review.model';
import { environment } from '../../../environments/env';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit, OnDestroy {
  private userService = inject(UserServices);
  private orderService = inject(OrderServices);
  private authService = inject(AuthServices);
  private reviewService = inject(ReviewServices);
  private cdr = inject(ChangeDetectorRef);
  private subscriptions = new Subscription();
  staticURL = environment.staticURL;

  user: IUser | null = null;
  orders: IOrder[] = [];

  activeTab: 'details' | 'addresses' | 'orders' = 'details';

  // Review State
  myReview: IReview | null = null;
  isReviewModalOpen = false;
  reviewRating = 5;
  hoveredRating = 0;
  reviewComment = '';
  isSubmittingReview = false;
  isDeletingReview = false;
  reviewError = '';

  // Form Model
  name = '';
  phone = '';
  age: number | null = null;
  gender: 'male' | 'female' = 'male';

  // Address Model
  newAddress = '';

  isLoading = true;
  isSaving = false;
  isCancellingOrder: string | null = null;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.loadProfile();
    this.loadOrders();
    this.loadMyReview();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadProfile(): void {
    this.isLoading = true;
    const sub = this.userService.getMyProfile().subscribe({
      next: (res) => {
        this.user = res.data;
        this.name = res.data.name || '';
        this.phone = res.data.phone || '';
        this.age = res.data.age ?? null;
        this.gender = res.data.gender || 'male';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load user profile.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
    this.subscriptions.add(sub);
  }

  loadOrders(): void {
    const sub = this.orderService.getMyPurchases().subscribe({
      next: (res) => {
        this.orders = res.data || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load purchases:', err);
      },
    });
    this.subscriptions.add(sub);
  }

  onUpdateProfile(): void {
    if (!this.name.trim()) {
      this.errorMessage = 'Name is required.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: Partial<IUser> = {
      name: this.name.trim(),
      phone: this.phone.trim(),
      gender: this.gender,
    };
    if (this.age !== null && this.age > 0) {
      payload.age = Number(this.age);
    }

    const sub = this.userService.updateMyProfile(payload).subscribe({
      next: (res) => {
        this.user = res.data;
        this.isSaving = false;
        this.successMessage = 'Profile updated successfully!';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Failed to update profile.';
        this.cdr.detectChanges();
      },
    });
    this.subscriptions.add(sub);
  }

  onAddAddress(): void {
    if (!this.newAddress.trim()) return;

    const currentAddresses = this.user?.addresses || [];
    const updated = [...currentAddresses, this.newAddress.trim()];

    this.saveAddresses(updated, 'New address added successfully!');
    this.newAddress = '';
  }

  onRemoveAddress(index: number): void {
    const currentAddresses = this.user?.addresses || [];
    const updated = currentAddresses.filter((_, i) => i !== index);
    this.saveAddresses(updated, 'Address removed successfully.');
  }

  private saveAddresses(addresses: string[], successMsg: string): void {
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const sub = this.userService.updateMyProfile({ addresses }).subscribe({
      next: (res) => {
        this.user = res.data;
        this.isSaving = false;
        this.successMessage = successMsg;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Failed to update address.';
        this.cdr.detectChanges();
      },
    });
    this.subscriptions.add(sub);
  }

  onCancelOrder(orderId: string): void {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    this.isCancellingOrder = orderId;
    this.errorMessage = '';

    const sub = this.orderService.cancelPurchase(orderId).subscribe({
      next: (res) => {
        this.isCancellingOrder = null;
        this.successMessage = 'Order has been cancelled.';
        this.loadOrders();
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err) => {
        this.isCancellingOrder = null;
        this.errorMessage = err.error?.message || 'Failed to cancel order.';
        this.cdr.detectChanges();
      },
    });
    this.subscriptions.add(sub);
  }

  getProductName(item: IOrderProduct): string {
    if (typeof item.product === 'object' && item.product && 'name' in item.product) {
      return item.product.name;
    }
    return 'Item';
  }

  getProductImage(item: IOrderProduct): string {
    if (typeof item.product === 'object' && item.product && 'imageURL' in item.product && item.product.imageURL) {
      const img = item.product.imageURL;
      if (img.startsWith('http://') || img.startsWith('https://')) {
        return img;
      }
      return this.staticURL + img;
    }
    return '';
  }

  canCancelOrder(order: IOrder): boolean {
    return order.status === 'pending' || order.status === 'processing';
  }

  setActiveTab(tab: 'details' | 'addresses' | 'orders'): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onLogout(): void {
    this.authService.logout();
  }

  getUserInitial(): string {
    return (this.user?.name || 'U').charAt(0).toUpperCase();
  }

  loadMyReview(): void {
    const sub = this.reviewService.getMyReview().subscribe({
      next: (res) => {
        this.myReview = res.data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.myReview = null;
        this.cdr.detectChanges();
      },
    });
    this.subscriptions.add(sub);
  }

  openReviewModal(): void {
    if (this.myReview) {
      this.reviewRating = this.myReview.rating || 5;
      this.reviewComment = this.myReview.comment || '';
    } else {
      this.reviewRating = 5;
      this.reviewComment = '';
    }
    this.hoveredRating = 0;
    this.reviewError = '';
    this.isReviewModalOpen = true;
  }

  closeReviewModal(): void {
    this.isReviewModalOpen = false;
    this.hoveredRating = 0;
    this.reviewError = '';
  }

  setRating(val: number): void {
    this.reviewRating = val;
  }

  setHoveredRating(val: number): void {
    this.hoveredRating = val;
  }

  getRatingText(): string {
    const rating = this.hoveredRating || this.reviewRating;
    switch (rating) {
      case 1:
        return '1.0 - Poor / Needs attention';
      case 2:
        return '2.0 - Fair / Could be better';
      case 3:
        return '3.0 - Good / It was okay';
      case 4:
        return '4.0 - Very Good! Happy with service';
      case 5:
        return '5.0 - Excellent! Loved the experience';
      default:
        return 'Select a rating';
    }
  }

  onSubmitReview(): void {
    if (!this.reviewRating || this.reviewRating < 1 || this.reviewRating > 5) {
      this.reviewError = 'Please select a star rating between 1 and 5.';
      return;
    }

    if (!this.reviewComment || this.reviewComment.trim().length < 5) {
      this.reviewError = 'Your review message must be at least 5 characters long.';
      return;
    }

    this.isSubmittingReview = true;
    this.reviewError = '';

    const payload = {
      rating: Number(this.reviewRating),
      comment: this.reviewComment.trim(),
    };

    const isUpdate = !!this.myReview;
    const request$ = isUpdate
      ? this.reviewService.updateMyReview(payload)
      : this.reviewService.createMyReview(payload);

    const sub = request$.subscribe({
      next: (res) => {
        this.myReview = res.data;
        this.isSubmittingReview = false;
        this.isReviewModalOpen = false;
        this.successMessage = isUpdate
          ? 'Your website review has been updated successfully!'
          : 'Thank you! Your website review has been submitted successfully.';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err) => {
        this.isSubmittingReview = false;
        this.reviewError = err.error?.message || 'Failed to submit review. Please try again.';
        this.cdr.detectChanges();
      },
    });
    this.subscriptions.add(sub);
  }

  onDeleteReview(): void {
    if (!this.myReview) return;
    if (!confirm('Are you sure you want to delete your website review?')) return;

    this.isDeletingReview = true;
    this.reviewError = '';

    const sub = this.reviewService.deleteMyReview().subscribe({
      next: () => {
        this.myReview = null;
        this.reviewRating = 5;
        this.reviewComment = '';
        this.isDeletingReview = false;
        this.isReviewModalOpen = false;
        this.successMessage = 'Your review has been removed.';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err) => {
        this.isDeletingReview = false;
        this.reviewError = err.error?.message || 'Failed to delete review.';
        this.cdr.detectChanges();
      },
    });
    this.subscriptions.add(sub);
  }
}
