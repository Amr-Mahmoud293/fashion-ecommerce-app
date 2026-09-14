import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IFaq } from '../../../core/models/faq.model';

@Component({
  selector: 'app-faq-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './faq-form.html',
  styleUrl: './faq-form.css',
})
export class FaqForm implements OnChanges {
  @Input() faq: IFaq | null = null;
  @Input() isSubmitting = false;

  @Output() save = new EventEmitter<{ question: string; answer: string }>();
  @Output() cancel = new EventEmitter<void>();

  faqForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.faqForm = this.fb.group({
      question: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(300),
        ],
      ],
      answer: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(1000),
        ],
      ],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['faq']) {
      if (this.faq) {
        this.faqForm.patchValue({
          question: this.faq.question,
          answer: this.faq.answer,
        });
      } else {
        this.faqForm.reset();
      }
    }
  }

  onSubmit(): void {
    if (this.faqForm.invalid || this.isSubmitting) {
      this.faqForm.markAllAsTouched();
      return;
    }

    const { question, answer } = this.faqForm.value;
    this.save.emit({
      question: question.trim(),
      answer: answer.trim(),
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
