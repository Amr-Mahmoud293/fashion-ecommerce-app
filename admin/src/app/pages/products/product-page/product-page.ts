import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductServices } from '../../../core/services/product-services';
import { CategoryServices } from '../../../core/services/category-services';
import { SubcategoryServices } from '../../../core/services/subcategory-services';
import { IProduct, IProductQueryParams } from '../../../core/models/product.model';
import { ICategory } from '../../../core/models/category.model';
import { ISubcategory } from '../../../core/models/subcategory.model';
import { ProductList } from '../product-list/product-list';
import { ProductForm } from '../product-form/product-form';

@Component({
  selector: 'app-product-page',
  imports: [CommonModule, FormsModule, ProductList, ProductForm],
  templateUrl: './product-page.html',
  styleUrl: './product-page.css',
})
export class ProductPage implements OnInit {
  private productService = inject(ProductServices);
  private categoryService = inject(CategoryServices);
  private subcategoryService = inject(SubcategoryServices);

  // Data Signals
  products = signal<IProduct[]>([]);
  categories = signal<ICategory[]>([]);
  subCategories = signal<ISubcategory[]>([]);

  // Pagination & Filtering Signals
  total = signal<number>(0);
  page = signal<number>(1);
  limit = signal<number>(10);
  totalPages = signal<number>(1);
  selectedCategory = signal<string>('');
  searchQuery = signal<string>('');

  // UI State Signals
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  showFormModal = signal<boolean>(false);
  selectedProductForEdit = signal<IProduct | null>(null);
  feedback = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  ngOnInit(): void {
    this.loadCategories();
    this.loadSubcategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (res) => {
        this.categories.set(res.data);
      },
      error: (err) => {
        console.error('Failed to load categories', err);
      },
    });
  }

  loadSubcategories(): void {
    this.subcategoryService.getAllSubcategories().subscribe({
      next: (res) => {
        this.subCategories.set(res.data);
      },
      error: (err) => {
        console.error('Failed to load subcategories', err);
      },
    });
  }

  loadProducts(): void {
    this.isLoading.set(true);

    const params: IProductQueryParams = {
      page: this.page(),
      limit: this.limit(),
    };

    if (this.selectedCategory()) {
      params.category = this.selectedCategory();
    }
    if (this.searchQuery().trim()) {
      params.search = this.searchQuery().trim();
    }

    this.productService.getAllProducts(params).subscribe({
      next: (res) => {
        this.products.set(res.results);
        this.total.set(res.total);
        this.totalPages.set(res.totalPages);
        this.page.set(res.page);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.showFeedback('error', 'Failed to fetch products.');
      },
    });
  }

  onFilterChange(): void {
    this.page.set(1);
    this.loadProducts();
  }

  onSearch(): void {
    this.page.set(1);
    this.loadProducts();
  }

  onClearFilters(): void {
    this.selectedCategory.set('');
    this.searchQuery.set('');
    this.page.set(1);
    this.loadProducts();
  }

  onPageChange(newPage: number): void {
    this.page.set(newPage);
    this.loadProducts();
  }

  openCreateModal(): void {
    this.selectedProductForEdit.set(null);
    this.showFormModal.set(true);
  }

  openEditModal(product: IProduct): void {
    this.selectedProductForEdit.set(product);
    this.showFormModal.set(true);
  }

  closeModal(): void {
    this.showFormModal.set(false);
    this.selectedProductForEdit.set(null);
  }

  /**
   * CRITICAL: Handles FormData emitted from ProductForm and dispatches to ProductServices
   */
  handleFormSave(formData: FormData): void {
    this.isSubmitting.set(true);

    const currentEdit = this.selectedProductForEdit();

    if (currentEdit) {
      // Update operation with FormData
      this.productService.updateProduct(currentEdit._id, formData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.showFeedback('success', `Product "${currentEdit.name}" updated successfully!`);
          this.loadProducts();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.showFeedback('error', err.error?.message || 'Failed to update product.');
        },
      });
    } else {
      // Create operation with FormData
      this.productService.createProduct(formData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.showFeedback('success', 'New product added successfully to catalog!');
          this.loadProducts();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.showFeedback('error', err.error?.message || 'Failed to create product.');
        },
      });
    }
  }

  handleDelete(productId: string): void {
    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        this.showFeedback('success', 'Product deleted successfully.');
        this.loadProducts();
      },
      error: (err) => {
        this.showFeedback('error', err.error?.message || 'Failed to delete product.');
      },
    });
  }

  private showFeedback(type: 'success' | 'error', text: string): void {
    this.feedback.set({ type, text });
    setTimeout(() => {
      this.feedback.set(null);
    }, 4500);
  }
}

