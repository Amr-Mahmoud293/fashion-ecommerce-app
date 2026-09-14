import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/env';
import { ICart, ICartRes, ILocalCartItem } from '../models/cart.model';
import { AuthServices } from './auth-services';

@Injectable({
  providedIn: 'root',
})
export class CartServices {
  private http = inject(HttpClient);
  private authService = inject(AuthServices);
  private apiUrl = environment.apiURL + 'cart';
  private guestCartKey = 'guest_cart';
  private cartSubject = new BehaviorSubject<ICart | null>(null);
  cart$ = this.cartSubject.asObservable();
  addToCart(productId: string, quantity: number = 1, price?: number): Observable<ICartRes> {
    if (this.authService.isLogin()) {
      return this.http
        .post<ICartRes>(`${this.apiUrl}/items`, { productId, quantity })
        .pipe(tap((res) => this.cartSubject.next(res.data)));
    } else {
      const localItems = this.getGuestCartLocal();
      const existingItem = localItems.find((item) => item.productId === productId);

      if (existingItem) {
        existingItem.quantity += quantity;
        if (price !== undefined) existingItem.price = price;
      } else {
        localItems.push({ productId, quantity, price });
      }

      this.saveGuestCartLocal(localItems);
      return this.fetchOrBuildGuestCart(localItems);
    }
  }

  getCart(): Observable<ICartRes> {
    if (this.authService.isLogin()) {
      return this.http.get<ICartRes>(this.apiUrl).pipe(
        tap((res) => this.cartSubject.next(res.data))
      );
    } else {
      const localItems = this.getGuestCartLocal();
      if (localItems.length === 0) {
        const emptyCart: ICart = { items: [], changedItems: [], totalCartPrice: 0 };
        this.cartSubject.next(emptyCart);
        return of({
          message: 'Guest cart is empty',
          hasChanges: false,
          data: emptyCart,
        });
      }
      return this.fetchOrBuildGuestCart(localItems);
    }
  }


  updateQuantity(productId: string, quantity: number): Observable<ICartRes> {
    if (this.authService.isLogin()) {
      return this.http
        .put<ICartRes>(`${this.apiUrl}/items/${productId}`, { quantity })
        .pipe(tap((res) => this.cartSubject.next(res.data)));
    } else {
      let localItems = this.getGuestCartLocal();
      if (quantity <= 0) {
        localItems = localItems.filter((item) => item.productId !== productId);
      } else {
        const item = localItems.find((i) => i.productId === productId);
        if (item) {
          item.quantity = quantity;
        }
      }

      this.saveGuestCartLocal(localItems);

      if (localItems.length === 0) {
        const emptyCart: ICart = { items: [], changedItems: [], totalCartPrice: 0 };
        this.cartSubject.next(emptyCart);
        return of({
          message: 'Guest cart updated',
          hasChanges: false,
          data: emptyCart,
        });
      }

      return this.fetchOrBuildGuestCart(localItems);
    }
  }

  removeItem(productId: string): Observable<ICartRes> {
    if (this.authService.isLogin()) {
      return this.http
        .delete<ICartRes>(`${this.apiUrl}/items/${productId}`)
        .pipe(tap((res) => this.cartSubject.next(res.data)));
    } else {
      const localItems = this.getGuestCartLocal().filter(
        (item) => item.productId !== productId
      );
      this.saveGuestCartLocal(localItems);

      if (localItems.length === 0) {
        const emptyCart: ICart = { items: [], changedItems: [], totalCartPrice: 0 };
        this.cartSubject.next(emptyCart);
        return of({
          message: 'Item removed from guest cart',
          hasChanges: false,
          data: emptyCart,
        });
      }

      return this.fetchOrBuildGuestCart(localItems);
    }
  }


  syncCart(): Observable<ICartRes | null> {
    const localItems = this.getGuestCartLocal();
    if (!localItems || localItems.length === 0) {
      return this.getCart().pipe(map((res) => res));
    }
    const payload = {
      localItems: localItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price ?? 0,
      })),
    };

    return this.http.post<ICartRes>(`${this.apiUrl}/sync`, payload).pipe(
      tap((res) => {
        this.clearGuestCartLocal();
        this.cartSubject.next(res.data);
      })
    );
  }

  acceptChange(productId: string): Observable<ICartRes> {
    return this.http
      .put<ICartRes>(`${this.apiUrl}/changes/${productId}`, {})
      .pipe(tap((res) => this.cartSubject.next(res.data)));
  }

 
  clearCart(): Observable<ICartRes> {
    if (this.authService.isLogin()) {
      return this.http.delete<ICartRes>(this.apiUrl).pipe(
        tap((res) => this.cartSubject.next(res.data))
      );
    } else {
      this.clearGuestCartLocal();
      const emptyCart: ICart = { items: [], changedItems: [], totalCartPrice: 0 };
      this.cartSubject.next(emptyCart);
      return of({
        message: 'Guest cart cleared',
        hasChanges: false,
        data: emptyCart,
      });
    }
  }

  getGuestCartLocal(): ILocalCartItem[] {
    try {
      const data = localStorage.getItem(this.guestCartKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveGuestCartLocal(items: ILocalCartItem[]): void {
    localStorage.setItem(this.guestCartKey, JSON.stringify(items));
  }

  clearGuestCartLocal(): void {
    localStorage.removeItem(this.guestCartKey);
  }

  private fetchOrBuildGuestCart(localItems: ILocalCartItem[]): Observable<ICartRes> {
    const payload = {
      localItems: localItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price ?? 0,
      })),
    };

    return this.http.post<ICartRes>(`${this.apiUrl}/guest`, payload).pipe(
      tap((res) => this.cartSubject.next(res.data)),
      catchError(() => {
        const fallbackCart: ICart = {
          items: localItems.map((item) => ({
            product: item.product || {
              _id: item.productId,
              name: 'Product ' + item.productId,
              price: item.price || 0,
            },
            quantity: item.quantity,
            priceAtAddition: item.price || 0,
          })),
          changedItems: [],
          totalCartPrice: localItems.reduce(
            (sum, i) => sum + (i.price || 0) * i.quantity,
            0
          ),
        };
        this.cartSubject.next(fallbackCart);
        return of({
          message: 'Guest cart loaded locally',
          hasChanges: false,
          data: fallbackCart,
        });
      })
    );
  }
}
