import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IFaq } from '../../../core/models/faq.model';

@Component({
  selector: 'app-faq-list',
  imports: [CommonModule],
  templateUrl: './faq-list.html',
  styleUrl: './faq-list.css',
})
export class FaqList {
  @Input({ required: true }) faqs: IFaq[] = [];
  @Input() isLoading = false;

  @Output() edit = new EventEmitter<IFaq>();
  @Output() delete = new EventEmitter<string>();

  expandedId: string | null = null;

  toggleExpand(id: string): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  onEdit(faq: IFaq, event: Event): void {
    event.stopPropagation();
    this.edit.emit(faq);
  }

  onDelete(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this FAQ item?')) {
      this.delete.emit(id);
    }
  }
}
