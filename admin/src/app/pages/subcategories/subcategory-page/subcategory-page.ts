import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubcategoryServices } from '../../../core/services/subcategory-services';
import { CategoryServices } from '../../../core/services/category-services';
import { ISubcategory } from '../../../core/models/subcategory.model';
import { ICategory } from '../../../core/models/category.model';
import { SubcategoryList } from '../subcategory-list/subcategory-list';
import { SubcategoryForm } from '../subcategory-form/subcategory-form';

@Component({
  selector: 'app-subcategory-page',
  imports: [CommonModule, FormsModule, SubcategoryList, SubcategoryForm],
  templateUrl: './subcategory-page.html',
  styleUrl: './subcategory-page.css',
})
export class SubcategoryPage implements OnInit {
  private subcategoryService = inject(SubcategoryServices);
  private categoryService = inject(CategoryServices);

  subCategories = signal<ISubcategory[]>([]);
  categories = signal<ICategory[]>([]);
  selectedCategoryFilter = signal<string>('');
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  showFormModal = signal<boolean>(false);
  selectedSubCategoryForEdit = signal<ISubcategory | null>(null);
  feedback = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  filteredSubCategories = computed(() => {
    let list = this.subCategories();
    const catFilter = this.selectedCategoryFilter();
    const query = this.searchQuery().toLowerCase().trim();

    if (catFilter) {
      list = list.filter((sub) => {
        const parentId = typeof sub.category === 'object' ? sub.category?._id : sub.category;
        return parentId === catFilter;
      });
    }

    if (query) {
      list = list.filter((sub) => sub.name.toLowerCase().includes(query));
    }

    return list;
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);

    this.categoryService.getAllCategories().subscribe({
      next: (res) => {
        this.categories.set(res.data);
      },
      error: (err) => {
        console.error('Failed to load categories', err);
      },
    });

    this.subcategoryService.getAllSubcategories().subscribe({
      next: (res) => {
        this.subCategories.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.showFeedback('error', 'Failed to load subcategories.');
      },
    });
  }

  openCreateModal(): void {
    this.selectedSubCategoryForEdit.set(null);
    this.showFormModal.set(true);
  }

  openEditModal(subCategory: ISubcategory): void {
    this.selectedSubCategoryForEdit.set(subCategory);
    this.showFormModal.set(true);
  }

  closeModal(): void {
    this.showFormModal.set(false);
    this.selectedSubCategoryForEdit.set(null);
  }

  handleFormSave(data: { name: string; category: string }): void {
    this.isSubmitting.set(true);
    const current = this.selectedSubCategoryForEdit();

    if (current) {
      this.subcategoryService.updateSubCategory(current._id, data).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.showFeedback('success', `Subcategory "${data.name}" updated successfully!`);
          this.loadData();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.showFeedback('error', err.error?.message || 'Failed to update subcategory.');
        },
      });
    } else {
      this.subcategoryService.createSubCategory(data).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.showFeedback('success', 'Subcategory created successfully!');
          this.loadData();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.showFeedback('error', err.error?.message || 'Failed to create subcategory.');
        },
      });
    }
  }

  handleDelete(id: string): void {
    this.subcategoryService.deleteSubCategory(id).subscribe({
      next: () => {
        this.showFeedback('success', 'Subcategory deleted successfully.');
        this.loadData();
      },
      error: (err) => {
        this.showFeedback('error', err.error?.message || 'Failed to delete subcategory.');
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
