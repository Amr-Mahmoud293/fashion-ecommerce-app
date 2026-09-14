import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ISubcategory } from '../../../core/models/subcategory.model';
import { ICategory } from '../../../core/models/category.model';

@Component({
  selector: 'app-subcategory-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './subcategory-form.html',
  styleUrl: './subcategory-form.css',
})
export class SubcategoryForm implements OnInit, OnChanges {
  @Input() subCategoryToEdit: ISubcategory | null = null;
  @Input() categories: ICategory[] = [];
  @Input() isSubmitting = false;

  @Output() save = new EventEmitter<{ name: string; category: string }>();
  @Output() cancel = new EventEmitter<void>();

  subCategoryForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['subCategoryToEdit'] && this.subCategoryForm) {
      this.populateForm();
    }
  }

  private initForm(): void {
    this.subCategoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      category: ['', [Validators.required]],
    });

    if (this.subCategoryToEdit) {
      this.populateForm();
    }
  }

  private populateForm(): void {
    if (this.subCategoryToEdit) {
      const catId = typeof this.subCategoryToEdit.category === 'object'
        ? this.subCategoryToEdit.category._id
        : this.subCategoryToEdit.category;

      this.subCategoryForm.patchValue({
        name: this.subCategoryToEdit.name,
        category: catId,
      });
    } else {
      this.subCategoryForm.reset({ name: '', category: '' });
    }
  }

  onSubmit(): void {
    if (this.subCategoryForm.invalid) {
      this.subCategoryForm.markAllAsTouched();
      return;
    }

    this.save.emit(this.subCategoryForm.value);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
