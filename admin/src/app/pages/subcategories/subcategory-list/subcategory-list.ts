import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ISubcategory } from '../../../core/models/subcategory.model';

@Component({
  selector: 'app-subcategory-list',
  imports: [CommonModule],
  templateUrl: './subcategory-list.html',
  styleUrl: './subcategory-list.css',
})
export class SubcategoryList {
  @Input({ required: true }) subCategories: ISubcategory[] = [];
  @Input() isLoading = false;

  @Output() editSubCategory = new EventEmitter<ISubcategory>();
  @Output() deleteSubCategory = new EventEmitter<string>();

  onEdit(subCategory: ISubcategory): void {
    this.editSubCategory.emit(subCategory);
  }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this subcategory? Note: this will also delete associated products.')) {
      this.deleteSubCategory.emit(id);
    }
  }
}
