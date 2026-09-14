import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryServices } from '../../../core/services/category-services';
import { ICategory } from '../../../core/models/category.model';
import { CategoryList } from '../category-list/category-list';
import { CategoryForm } from '../category-form/category-form';

@Component({
  selector: 'app-category-page',
  imports: [CommonModule, FormsModule, CategoryList, CategoryForm],
  templateUrl: './category-page.html',
  styleUrl: './category-page.css',
})
export class CategoryPage implements OnInit {
  private categoryService = inject(CategoryServices);

  categories = signal<ICategory[]>([]);
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  showFormModal = signal<boolean>(false);
  selectedCategoryForEdit = signal<ICategory | null>(null);
  feedback = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  filteredCategories = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.categories();
    return this.categories().filter((cat) => cat.name.toLowerCase().includes(q));
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.categoryService.getAllCategories().subscribe({
      next: (res) => {
        this.categories.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.showFeedback('error', 'Failed to load categories.');
      },
    });
  }

  openCreateModal(): void {
    this.selectedCategoryForEdit.set(null);
    this.showFormModal.set(true);
  }

  openEditModal(category: ICategory): void {
    this.selectedCategoryForEdit.set(category);
    this.showFormModal.set(true);
  }

  closeModal(): void {
    this.showFormModal.set(false);
    this.selectedCategoryForEdit.set(null);
  }

  handleFormSave(data: { name: string }): void {
    this.isSubmitting.set(true);
    const current = this.selectedCategoryForEdit();

    if (current) {
      this.categoryService.updateCategory(current._id, data).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.showFeedback('success', `Category "${data.name}" updated successfully!`);
          this.loadCategories();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.showFeedback('error', err.error?.message || 'Failed to update category.');
        },
      });
    } else {
      this.categoryService.createCategory(data).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.showFeedback('success', 'Category created successfully!');
          this.loadCategories();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.showFeedback('error', err.error?.message || 'Failed to create category.');
        },
      });
    }
  }

  handleDelete(id: string): void {
    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.showFeedback('success', 'Category deleted successfully.');
        this.loadCategories();
      },
      error: (err) => {
        this.showFeedback('error', err.error?.message || 'Failed to delete category.');
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
