import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShippingServices } from '../../../core/services/shipping-services';
import { IShipping } from '../../../core/models/shipping.model';
import { ShippingList } from '../shipping-list/shipping-list';
import { ShippingForm } from '../shipping-form/shipping-form';

@Component({
  selector: 'app-shipping-page',
  imports: [CommonModule, FormsModule, ShippingList, ShippingForm],
  templateUrl: './shipping-page.html',
  styleUrl: './shipping-page.css',
})
export class ShippingPage implements OnInit {
  private shippingService = inject(ShippingServices);

  shippingOptions = signal<IShipping[]>([]);
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  showFormModal = signal<boolean>(false);
  selectedShippingForEdit = signal<IShipping | null>(null);
  feedback = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  filteredShippingOptions = computed(() => {
    let list = this.shippingOptions();
    const query = this.searchQuery().toLowerCase().trim();

    if (query) {
      list = list.filter((item) => item.city.toLowerCase().includes(query));
    }

    return list;
  });

  ngOnInit(): void {
    this.loadShippingOptions();
  }

  loadShippingOptions(): void {
    this.isLoading.set(true);

    this.shippingService.getShippingOptions().subscribe({
      next: (res) => {
        this.shippingOptions.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.showFeedback('error', 'Failed to load shipping options.');
      },
    });
  }

  openCreateModal(): void {
    this.selectedShippingForEdit.set(null);
    this.showFormModal.set(true);
  }

  openEditModal(item: IShipping): void {
    this.selectedShippingForEdit.set(item);
    this.showFormModal.set(true);
  }

  closeModal(): void {
    this.showFormModal.set(false);
    this.selectedShippingForEdit.set(null);
  }

  handleFormSave(data: { city: string; cost: number }): void {
    this.isSubmitting.set(true);
    const current = this.selectedShippingForEdit();

    if (current) {
      this.shippingService.updateShippingOption(current._id, data).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.showFeedback('success', `Shipping option for "${data.city}" updated successfully!`);
          this.loadShippingOptions();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.showFeedback('error', err.error?.message || 'Failed to update shipping option.');
        },
      });
    } else {
      this.shippingService.createShippingOption(data).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.showFeedback('success', `Shipping option for "${data.city}" created successfully!`);
          this.loadShippingOptions();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.showFeedback('error', err.error?.message || 'Failed to create shipping option.');
        },
      });
    }
  }

  handleDelete(id: string): void {
    this.shippingService.deleteShippingOption(id).subscribe({
      next: () => {
        this.showFeedback('success', 'Shipping option deleted successfully.');
        this.loadShippingOptions();
      },
      error: (err) => {
        this.showFeedback('error', err.error?.message || 'Failed to delete shipping option.');
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
