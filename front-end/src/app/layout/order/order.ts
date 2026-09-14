import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserServices } from '../../core/services/user-services';
import { CartServices } from '../../core/services/cart-services';
import { ShippingServices } from '../../core/services/shipping-services';
import { OrderServices } from '../../core/services/order-services';
import { ICart } from '../../core/models/cart.model';
import { IShipping } from '../../core/models/shipping.model';
import { IOrder } from '../../core/models/order.model';
import { environment } from '../../../environments/env';

@Component({
  selector: 'app-order',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './order.html',
  styleUrl: './order.css',
})
export class Order implements OnInit {
  private userServices = inject(UserServices);
  private cartService = inject(CartServices);
  private shippingServices = inject(ShippingServices);
  private orderServices = inject(OrderServices);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  staticURL = environment.staticURL;

  get totalItemsCount(): number {
    return this.cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;
  }

  userAddresses: string[] = [];
  selectedAddress: string = '';
  customAddress: string = '';

  shippingOptions: IShipping[] = [];
  selectedShippingId: string = '';

  cart: ICart | null = null;

  isLoading = false;
  isPlacingOrder = false;
  errorMessage = '';
  successMessage = '';
  placedOrder: IOrder | null = null;

  ngOnInit(): void {
    this.loadCheckoutData();
  }

  loadCheckoutData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.userServices.getMyProfile().subscribe({
      next: (profileRes) => {
        this.userAddresses = profileRes.data.addresses || [];
        if (this.userAddresses.length > 0) {
          this.selectedAddress = this.userAddresses[0];
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load user profile addresses:', err);
        this.cdr.detectChanges();
      },
    });

    this.shippingServices.getShippingOptions().subscribe({
      next: (shippingRes) => {
        this.shippingOptions = shippingRes.data || [];
        if (this.shippingOptions.length > 0) {
          this.selectedShippingId = this.shippingOptions[0]._id;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load shipping options:', err);
        this.cdr.detectChanges();
      },
    });

    this.cartService.getCart().subscribe({
      next: (cartRes) => {
        this.cart = cartRes.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load cart summary';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get selectedShippingOption(): IShipping | undefined {
    return this.shippingOptions.find((s) => s._id === this.selectedShippingId);
  }

  get shippingFee(): number {
    return this.selectedShippingOption?.cost ?? 0;
  }

  get grandTotal(): number {
    return (this.cart?.totalCartPrice ?? 0) + this.shippingFee;
  }

  placeOrder(addressId?: string): void {
    this.errorMessage = '';
    this.successMessage = '';

    const finalAddress =
      addressId || (this.selectedAddress === '__custom__' ? this.customAddress : this.selectedAddress);

    if (!finalAddress || !finalAddress.trim()) {
      this.errorMessage = 'Please select or enter a valid shipping address.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.selectedShippingId) {
      this.errorMessage = 'Please select a shipping option.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.cart || this.cart.items.length === 0) {
      this.errorMessage = 'Your cart is empty. Cannot checkout.';
      this.cdr.detectChanges();
      return;
    }

    if (this.cart.changedItems && this.cart.changedItems.length > 0) {
      this.errorMessage =
        'Your cart has pending price or quantity changes. Please review and accept them in your cart before placing an order.';
      this.cdr.detectChanges();
      return;
    }

    this.isPlacingOrder = true;
    this.cdr.detectChanges();

    this.orderServices
      .placeOrder({
        shippingAddress: finalAddress.trim(),
        shippingId: this.selectedShippingId,
      })
      .subscribe({
        next: (orderRes) => {
          this.isPlacingOrder = false;
          this.placedOrder = orderRes.data;
          this.successMessage = `Order placed successfully! Order #${orderRes.data.orderNumber}`;
          this.cartService.getCart().subscribe({
            next: () => this.cdr.detectChanges(),
            error: () => this.cdr.detectChanges()
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isPlacingOrder = false;
          this.errorMessage =
            err.error?.message || 'Something went wrong while placing your order. Please try again.';
          this.cdr.detectChanges();
        },
      });
  }
}
