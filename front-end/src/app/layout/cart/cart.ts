import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartServices } from '../../core/services/cart-services';
import { ICart, ICartItem } from '../../core/models/cart.model';
import { environment } from '../../../environments/env';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  private cartService = inject(CartServices);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  staticURL = environment.staticURL;
  cart: ICart | null = null;
  isLoading = false;
  errorMessage = '';

  get totalItemsCount(): number {
    return this.cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;
  }

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.cartService.getCart().subscribe({
      next: (res) => {
        this.cart = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load cart';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  increaseQuantity(item: ICartItem): void {
    const newQty = item.quantity + 1;
    this.updateQuantity(item.product._id, newQty);
  }

  decreaseQuantity(item: ICartItem): void {
    if (item.quantity > 1) {
      const newQty = item.quantity - 1;
      this.updateQuantity(item.product._id, newQty);
    } else {
      this.removeItem(item.product._id);
    }
  }

  onQuantityChange(productId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    if (!isNaN(value) && value > 0) {
      this.updateQuantity(productId, value);
    } else {
      this.loadCart();
    }
  }

  updateQuantity(productId: string, quantity: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.cartService.updateQuantity(productId, quantity).subscribe({
      next: (res) => {
        this.cart = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update item quantity';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  removeItem(productId: string): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.cartService.removeItem(productId).subscribe({
      next: (res) => {
        this.cart = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to remove item';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  acceptChange(productId: string): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.cartService.acceptChange(productId).subscribe({
      next: (res) => {
        this.cart = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to accept change';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  clearCart(): void {
    if (!confirm('Are you sure you want to clear your cart?')) return;
    this.isLoading = true;
    this.cdr.detectChanges();
    this.cartService.clearCart().subscribe({
      next: (res) => {
        this.cart = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to clear cart';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  proceedToCheckout(): void {
    this.router.navigate(['/order']);
  }
}
