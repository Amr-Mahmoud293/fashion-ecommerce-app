import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ICategory } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-form.html',
  styleUrl: './category-form.css',
})
export class CategoryForm implements OnInit, OnChanges {
  @Input() categoryToEdit: ICategory | null = null;
  @Input() isSubmitting = false;

  @Output() save = new EventEmitter<{ name: string }>();
  @Output() cancel = new EventEmitter<void>();

  categoryForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryToEdit'] && this.categoryForm) {
      this.populateForm();
    }
  }

  private initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
    });

    if (this.categoryToEdit) {
      this.populateForm();
    }
  }

  private populateForm(): void {
    if (this.categoryToEdit) {
      this.categoryForm.patchValue({
        name: this.categoryToEdit.name,
      });
    } else {
      this.categoryForm.reset({ name: '' });
    }
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.save.emit(this.categoryForm.value);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
