import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IFaq } from '../../../core/models/faq.model';

@Component({
  selector: 'app-faqcard',
  imports: [CommonModule],
  templateUrl: './faqcard.html',
  styleUrl: './faqcard.css',
})
export class Faqcard {
  @Input() faq!: IFaq;
  @Input() index: number = 0;
  @Input() isExpanded: boolean = false;
  @Output() toggleExpand = new EventEmitter<void>();

  onToggle(): void {
    if (this.toggleExpand.observed) {
      this.toggleExpand.emit();
    } else {
      this.isExpanded = !this.isExpanded;
    }
  }
}
