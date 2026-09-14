import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICategory } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-list',
  imports: [CommonModule],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
})
export class CategoryList {
  @Input({ required: true }) categories: ICategory[] = [];
  @Input() isLoading = false;

  @Output() editCategory = new EventEmitter<ICategory>();
  @Output() deleteCategory = new EventEmitter<string>();

  onEdit(category: ICategory): void {
    this.editCategory.emit(category);
  }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this category? Note: this will also delete associated subcategories and products.')) {
      this.deleteCategory.emit(id);
    }
  }
}
