import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FaqServices } from '../../../core/services/faq-services';
import { IFaq } from '../../../core/models/faq.model';
import { FaqList } from '../faq-list/faq-list';
import { FaqForm } from '../faq-form/faq-form';

@Component({
  selector: 'app-faq-page',
  imports: [CommonModule, FormsModule, FaqList, FaqForm],
  templateUrl: './faq-page.html',
  styleUrl: './faq-page.css',
})
export class FaqPage implements OnInit {
  private faqService = inject(FaqServices);

  faqs = signal<IFaq[]>([]);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  showFormModal = signal<boolean>(false);
  selectedFaqForEdit = signal<IFaq | null>(null);
  searchQuery = signal<string>('');
  feedback = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  filteredFaqs = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.faqs();
    return this.faqs().filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.loadFaqs();
  }

  loadFaqs(): void {
    this.isLoading.set(true);
    this.faqService.getAllFaqs({ limit: 100 }).subscribe({
      next: (res) => {
        this.faqs.set(res.results || []);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.showFeedback('error', err.error?.message || 'Failed to load FAQ items.');
      },
    });
  }

  openCreateModal(): void {
    this.selectedFaqForEdit.set(null);
    this.showFormModal.set(true);
  }

  openEditModal(faq: IFaq): void {
    this.selectedFaqForEdit.set(faq);
    this.showFormModal.set(true);
  }

  closeModal(): void {
    this.showFormModal.set(false);
    this.selectedFaqForEdit.set(null);
  }

  handleSave(data: { question: string; answer: string }): void {
    this.isSubmitting.set(true);
    const current = this.selectedFaqForEdit();

    if (current) {
      this.faqService.updateFaq(current._id, data).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.showFeedback('success', 'FAQ updated successfully!');
          this.loadFaqs();
        },
        error: (err: any) => {
          this.isSubmitting.set(false);
          this.showFeedback('error', err.error?.message || 'Failed to update FAQ.');
        },
      });
    } else {
      this.faqService.createFaq(data).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.showFeedback('success', 'FAQ created successfully!');
          this.loadFaqs();
        },
        error: (err: any) => {
          this.isSubmitting.set(false);
          this.showFeedback('error', err.error?.message || 'Failed to create FAQ.');
        },
      });
    }
  }

  handleDelete(id: string): void {
    this.faqService.deleteFaq(id).subscribe({
      next: () => {
        this.showFeedback('success', 'FAQ deleted successfully.');
        this.loadFaqs();
      },
      error: (err: any) => {
        this.showFeedback('error', err.error?.message || 'Failed to delete FAQ.');
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
