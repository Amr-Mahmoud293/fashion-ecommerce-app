import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductServices } from '../../core/services/product-services';
import { SubcategoryServices } from '../../core/services/subcategory-services';
import { IProduct } from '../../core/models/product.model';
import { ISubcategory } from '../../core/models/subcategory.model';
import { Product } from '../productslist/product/product';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, Product],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  productImageUrl = 'Forest Green Hoodie Product Shot.png';

  subcategories: ISubcategory[] = [];
  newArrivals: IProduct[] = [];
  topProducts: IProduct[] = [];

  private subscriptions: Subscription = new Subscription();

  constructor(
    private _productService: ProductServices,
    private _subcategoryService: SubcategoryServices,
    private _cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadSubcategories();
    this.loadNewArrivals();
    this.loadTopProducts();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadSubcategories(): void {
    const sub = this._subcategoryService.getAllSubcategories().subscribe({
      next: (res) => {
        this.subcategories = (res.data || []).slice(0, 4);
        this._cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching subcategories:', err);
      }
    });
    this.subscriptions.add(sub);
  }

  loadNewArrivals(): void {
    const sub = this._productService.getAllProducts({ isNewArrival: true, limit: 4 }).subscribe({
      next: (res) => {
        this.newArrivals = res.results || [];
        this._cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching new arrivals:', err);
      }
    });
    this.subscriptions.add(sub);
  }

  loadTopProducts(): void {
    const sub = this._productService.getAllProducts({ isTop: true, limit: 4 }).subscribe({
      next: (res) => {
        this.topProducts = res.results || [];
        this._cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching top products:', err);
      }
    });
    this.subscriptions.add(sub);
  }
}