import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { FaqServices } from '../../core/services/faq-services';
import { IFaq } from '../../core/models/faq.model';
import { Faqcard } from './faqcard/faqcard';

@Component({
  selector: 'app-faq',
  imports: [CommonModule, FormsModule, RouterLink, Faqcard],
  templateUrl: './faq.html',
  styleUrl: './faq.css',
})
export class Faq implements OnInit, OnDestroy {
  private faqService = inject(FaqServices);
  private cdr = inject(ChangeDetectorRef);
  private subscription = new Subscription();

  faqs: IFaq[] = [];
  filteredFaqs: IFaq[] = [];
  searchQuery: string = '';
  expandedId: string | null = null;
  isLoading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    this.loadFaqs();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadFaqs(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    const sub = this.faqService.getAllFaqs({ limit: 50 }).subscribe({
      next: (res) => {
        this.faqs = res.results || [];
        this.filteredFaqs = [...this.faqs];
        if (this.filteredFaqs.length > 0) {
          this.expandedId = this.filteredFaqs[0]._id;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch FAQs:', err);
        this.hasError = true;
        this.errorMessage = 'Unable to load FAQs at this time. Please check your connection and try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });

    this.subscription.add(sub);
  }

  toggleFaq(id: string): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  isExpanded(id: string): boolean {
    return this.expandedId === id;
  }

  onSearchChange(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.filteredFaqs = [...this.faqs];
      return;
    }

    this.filteredFaqs = this.faqs.filter(
      (item) =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
    );

    if (this.filteredFaqs.length > 0 && (!this.expandedId || !this.filteredFaqs.some(f => f._id === this.expandedId))) {
      this.expandedId = this.filteredFaqs[0]._id;
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.onSearchChange();
  }
}
