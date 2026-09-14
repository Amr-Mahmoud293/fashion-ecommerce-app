import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IProduct } from '../../../core/models/product.model';
import { ICategory } from '../../../core/models/category.model';
import { ISubcategory } from '../../../core/models/subcategory.model';
import { environment } from '../../../../environments/env';

@Component({
  selector: 'app-product-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm implements OnInit, OnChanges {
  @Input() productToEdit: IProduct | null = null;
  @Input() categories: ICategory[] = [];
  @Input() subCategories: ISubcategory[] = [];
  @Input() isSubmitting = false;

  @Output() save = new EventEmitter<FormData>();
  @Output() cancel = new EventEmitter<void>();

  productForm!: FormGroup;
  filteredSubCategories: ISubcategory[] = [];
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  fileError: string | null = null;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productToEdit'] && this.productForm) {
      this.populateForm();
    }
    if (changes['subCategories']) {
      this.filterSubCategories();
    }
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      price: [null, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]],
      subCategory: ['', [Validators.required]],
      slug: [''],
      isTop: [false],
      isNewArrival: [false],
      isActive: [true],
    });

    if (this.productToEdit) {
      this.populateForm();
    }
  }

  private populateForm(): void {
    if (!this.productToEdit) {
      this.productForm.reset({
        name: '',
        description: '',
        price: null,
        stock: 0,
        category: '',
        subCategory: '',
        slug: '',
        isTop: false,
        isNewArrival: false,
        isActive: true,
      });
      this.selectedFile = null;
      this.imagePreviewUrl = null;
      this.filteredSubCategories = [];
      return;
    }

    const catId = typeof this.productToEdit.category === 'object'
      ? this.productToEdit.category._id
      : this.productToEdit.category;

    const subCatId = typeof this.productToEdit.subCategory === 'object'
      ? this.productToEdit.subCategory._id
      : this.productToEdit.subCategory;

    this.productForm.patchValue({
      name: this.productToEdit.name,
      description: this.productToEdit.description,
      price: this.productToEdit.price,
      stock: this.productToEdit.stock,
      category: catId,
      subCategory: subCatId,
      slug: this.productToEdit.slug,
      isTop: this.productToEdit.isTop,
      isNewArrival: this.productToEdit.isNewArrival,
      isActive: this.productToEdit.isActive,
    });

    if (this.productToEdit.imageURL) {
      this.imagePreviewUrl = environment.staticURL + this.productToEdit.imageURL;
    }

    this.filterSubCategories();
  }

  onCategoryChange(): void {
    this.productForm.patchValue({ subCategory: '' });
    this.filterSubCategories();
  }

  filterSubCategories(): void {
    const selectedCat = this.productForm?.get('category')?.value;
    if (!selectedCat) {
      this.filteredSubCategories = this.subCategories;
      return;
    }
    this.filteredSubCategories = this.subCategories.filter((sub) => {
      const parentId = typeof sub.category === 'object' ? sub.category._id : sub.category;
      return parentId === selectedCat;
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fileError = null;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    if (!this.productToEdit && !this.selectedFile) {
      this.fileError = 'A product image is required for new items.';
      return;
    }

    const formData = new FormData();
    const val = this.productForm.value;

    formData.append('name', val.name);
    formData.append('price', String(val.price));
    formData.append('stock', String(val.stock));
    formData.append('category', val.category);
    formData.append('subCategory', val.subCategory);

    if (val.description) {
      formData.append('description', val.description);
    }
    if (val.slug) {
      formData.append('slug', val.slug);
    }

    formData.append('isTop', String(val.isTop ?? false));
    formData.append('isNewArrival', String(val.isNewArrival ?? false));
    formData.append('isActive', String(val.isActive ?? true));

    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }

    this.save.emit(formData);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}

