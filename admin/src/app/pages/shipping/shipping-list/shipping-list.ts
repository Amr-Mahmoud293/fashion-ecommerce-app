import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IShipping } from '../../../core/models/shipping.model';

@Component({
  selector: 'app-shipping-list',
  imports: [CommonModule],
  templateUrl: './shipping-list.html',
  styleUrl: './shipping-list.css',
})
export class ShippingList {
  @Input({ required: true }) shippingOptions: IShipping[] = [];
  @Input() isLoading = false;
  @Output() editShipping = new EventEmitter<IShipping>();
  @Output() deleteShipping = new EventEmitter<string>();
  onEdit(shipping: IShipping): void {
    this.editShipping.emit(shipping);
  }
  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this shipping option?')) {
      this.deleteShipping.emit(id);
    }
  }
}
