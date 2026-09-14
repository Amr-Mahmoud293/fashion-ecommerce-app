import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IReview } from '../../core/models/review.model';
import { ReviewList } from './review-list/review-list';

@Component({
  selector: 'app-review',
  imports: [CommonModule, ReviewList],
  templateUrl: './review.html',
  styleUrl: './review.css',
})
export class Review {
  @Input() reviews: IReview[] = [];
}
