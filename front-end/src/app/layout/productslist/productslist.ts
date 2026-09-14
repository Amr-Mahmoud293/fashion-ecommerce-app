import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProductServices } from '../../core/services/product-services';
import { SubcategoryServices } from '../../core/services/subcategory-services';
import { IProduct, IProductQueryParams } from '../../core/models/product.model';
import { ISubcategory } from '../../core/models/subcategory.model';
import { Product } from './product/product';

@Component({
  selector: 'app-productslist',
  imports: [Product, FormsModule],
  templateUrl: './productslist.html',
  styleUrl: './productslist.css',
})
export class Productslist implements OnInit, OnDestroy {
  myProducts: IProduct[] = [];
  subcategories: ISubcategory[] = [];
  subcategoryCounts: { [id: string]: number } = {};

  totalProducts: number = 0;
  selectedSubCategoryId: string | null = null;
  currentTitle: string = 'All Products';

  maxPrice: number = 1000;
  selectedSort: string = 'popular';

  private subscriptions: Subscription = new Subscription();

  constructor(
    private _productService: ProductServices,
    private _subcategoryService: SubcategoryServices,
    private _activeRoute: ActivatedRoute,
    private _cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadSubcategories();
    const querySub = this._activeRoute.queryParams.subscribe((qParams) => {
      const searchParam = qParams['search'];
      if (searchParam) {
        this.currentTitle = `Search: "${searchParam}"`;
      }
      this.loadProducts();
    });
    this.subscriptions.add(querySub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadSubcategories(): void {
    const sub = this._subcategoryService.getAllSubcategories().subscribe({
      next: (res) => {
        this.subcategories = res.data || [];

        const subParam = this._activeRoute.snapshot.queryParams['subCategory'];
        if (subParam) {
          const matched = this.subcategories.find(
            (s) => s._id === subParam || s.slug === subParam
          );
          if (matched) {
            this.selectedSubCategoryId = matched._id;
            this.currentTitle = matched.name;
          }
        }
        this.fetchCounts();
        this.loadProducts();
        this._cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching subcategories:', err);
        this.loadProducts();
      }
    });
    this.subscriptions.add(sub);
  }

  fetchCounts(): void {
    const countSub = this._productService.getAllProducts({ limit: 100 }).subscribe({
      next: (res) => {
        this.totalProducts = res.total || res.results?.length || 0;
        const counts: { [id: string]: number } = {};
        (res.results || []).forEach((p) => {
          const subId = p.subCategory?._id;
          if (subId) {
            counts[subId] = (counts[subId] || 0) + 1;
          }
        });
        this.subcategoryCounts = counts;
        this._cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching counts:', err);
      }
    });
    this.subscriptions.add(countSub);
  }

  loadProducts(): void {
    const params: IProductQueryParams = {
      limit: 50,
    };

    const searchParam = this._activeRoute.snapshot.queryParams['search'];
    if (searchParam) {
      params.search = searchParam;
    }

    if (this.selectedSubCategoryId) {
      params.subCategory = this.selectedSubCategoryId;
    }

    if (this.maxPrice < 1000) {
      params.maxPrice = this.maxPrice;
    }

    switch (this.selectedSort) {
      case 'popular':
        params.sort = 'isTop';
        params.order = 'desc';
        break;
      case 'price-asc':
        params.sort = 'price';
        params.order = 'asc';
        break;
      case 'price-desc':
        params.sort = 'price';
        params.order = 'desc';
        break;
      case 'newest':
        params.sort = 'isNewArrival';
        params.order = 'desc';
        break;
      default:
        params.sort = 'isTop';
        params.order = 'desc';
        break;
    }

    const prodSub = this._productService.getAllProducts(params).subscribe({
      next: (res) => {
        this.myProducts = res.results || [];
        this._cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.myProducts = [];
        this._cdr.detectChanges();
      }
    });
    this.subscriptions.add(prodSub);
  }

  selectSubCategory(subCat: ISubcategory | null): void {
    if (subCat) {
      this.selectedSubCategoryId = subCat._id;
      this.currentTitle = subCat.name;
    } else {
      this.selectedSubCategoryId = null;
      this.currentTitle = 'All Products';
    }
    this.loadProducts();
  }

  onPriceInput(): void {
    this._cdr.detectChanges();
  }

  onPriceChange(): void {
    this.loadProducts();
  }

  onSortChange(): void {
    this.loadProducts();
  }

  resetFilters(): void {
    this.selectedSubCategoryId = null;
    this.currentTitle = 'All Products';
    this.maxPrice = 1000;
    this.selectedSort = 'popular';
    this.loadProducts();
  }
}

