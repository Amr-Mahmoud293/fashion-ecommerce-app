import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductServices } from '../../../core/services/product-services';
import { CartServices } from '../../../core/services/cart-services';
import { IProduct } from '../../../core/models/product.model';
import { environment } from '../../../../environments/env';
import { Product } from '../product/product';

@Component({
  selector: 'app-productdetails',
  imports: [Product, RouterLink],
  templateUrl: './productdetails.html',
  styleUrl: './productdetails.css',
})
export class Productdetails implements OnInit {

  categorySlug!: string;
  productSlug!: string;
  myProduct!: IProduct;
  relatedProducts!: IProduct[];
  quantity: number = 1;
  staticURL = environment.staticURL;

  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private _activeRoute: ActivatedRoute,
    private _productService: ProductServices,
    private _cartService: CartServices,
    private _cdr: ChangeDetectorRef,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this._activeRoute.paramMap.subscribe({
      next: (params) => {
        const catSlug = params.get('categorySlug');
        const prodSlug = params.get('productSlug');
        if (catSlug && prodSlug) {
          this.categorySlug = catSlug;
          this.productSlug = prodSlug;
          this.fetchProduct();
        }
      }
    });
  }

  fetchProduct(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this._productService.getProductBySlug(this.categorySlug, this.productSlug).subscribe({
      next: (res) => {
        this.myProduct = res.data;
        this.quantity = 1;
        this.isLoading = false;
        this._cdr.detectChanges();
        this.loadRelatedProducts(this.myProduct._id);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 404) {
          this._router.navigate(['/products']);
        } else {
          this.errorMessage = 'Something went wrong while loading the product. Please try again later.';
        }
        this._cdr.detectChanges();
      }
    });
  }

  loadRelatedProducts(productId: string): void {
    this._productService.getRelatedProducts(productId).subscribe({
      next: (res) => {
        this.relatedProducts = res.data;
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.relatedProducts = [];
        this._cdr.detectChanges();
      }
    });
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
      this._cdr.detectChanges();
    }
  }

  increaseQuantity(): void {
    this.quantity++;
    this._cdr.detectChanges();
  }

  onAddToCart(): void {
    if (!this.myProduct?._id) return;
    this._cartService.addToCart(this.myProduct._id, this.quantity, this.myProduct.price).subscribe({
      next: () => {
        this._cdr.detectChanges();
      },
      error: (err) => {
        console.error('Add to cart failed:', err);
      }
    });
  }
}