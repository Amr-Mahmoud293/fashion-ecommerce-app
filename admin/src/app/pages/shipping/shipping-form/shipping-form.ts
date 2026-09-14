import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IShipping } from '../../../core/models/shipping.model';

@Component({
  selector: 'app-shipping-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './shipping-form.html',
  styleUrl: './shipping-form.css',
})
export class ShippingForm implements OnInit, OnChanges {
  @Input() shippingToEdit: IShipping | null = null;
  @Input() isSubmitting = false;
  @Output() save = new EventEmitter<{ city: string; cost: number }>();
  @Output() cancel = new EventEmitter<void>();
  shippingForm!: FormGroup;
  constructor(private fb: FormBuilder) { }
  ngOnInit(): void {
    this.initForm();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['shippingToEdit'] && this.shippingForm) {
      this.populateForm();
    }
  }
  private initForm(): void {
    this.shippingForm = this.fb.group({
      city: ['', [Validators.required, Validators.minLength(2)]],
      cost: [0, [Validators.required, Validators.min(0)]],
    });

    if (this.shippingToEdit) {
      this.populateForm();
    }
  }
  private populateForm(): void {
    if (this.shippingToEdit) {
      this.shippingForm.patchValue({
        city: this.shippingToEdit.city,
        cost: this.shippingToEdit.cost,
      });
    } else {
      this.shippingForm.reset({ city: '', cost: 0 });
    }
  }
  onSubmit(): void {
    if (this.shippingForm.invalid) {
      this.shippingForm.markAllAsTouched();
      return;
    }
    const val = this.shippingForm.value;
    this.save.emit({
      city: val.city.trim(),
      cost: Number(val.cost),
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
