import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportServices } from '../../../core/services/report-services';
import { ISalesSummary } from '../../../core/models/report.model';
import { environment } from '../../../../environments/env';

@Component({
  selector: 'app-report-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './report-page.html',
  styleUrl: './report-page.css',
})
export class ReportPage implements OnInit {
  private reportService = inject(ReportServices);

  summary = signal<ISalesSummary | null>(null);
  isLoading = signal<boolean>(false);
  startDate = signal<string>('2026-01-01');
  endDate = signal<string>(new Date().toISOString().split('T')[0]);
  activePeriodicView = signal<'monthly' | 'weekly' | 'yearly'>('monthly');
  feedback = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  readonly staticURL = environment.staticURL;

  // Computed KPIs based on the fetched data
  totalGrossRevenue = computed(() => {
    const s = this.summary();
    if (!s || !s.yearly) return 0;
    return s.yearly.reduce((acc, y) => acc + y.totalRevenue, 0);
  });

  totalPurchases = computed(() => {
    const s = this.summary();
    if (!s || !s.yearly) return 0;
    return s.yearly.reduce((acc, y) => acc + y.totalPurchases, 0);
  });

  totalUnitsSold = computed(() => {
    const s = this.summary();
    if (!s || !s.yearly) return 0;
    return s.yearly.reduce((acc, y) => acc + y.totalQuantity, 0);
  });

  avgOrderValue = computed(() => {
    const rev = this.totalGrossRevenue();
    const count = this.totalPurchases();
    return count > 0 ? rev / count : 0;
  });

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading.set(true);

    this.reportService.getSalesReports({
      startDate: this.startDate() || undefined,
      endDate: this.endDate() || undefined,
    }).subscribe({
      next: (res) => {
        const dataArr = res.data;
        if (dataArr && dataArr.length > 0) {
          this.summary.set(dataArr[0]);
        } else {
          this.summary.set(null);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.showFeedback('error', err.error?.message || 'Failed to load sales analytics.');
      },
    });
  }

  setPreset(preset: 'thisMonth' | 'thisYear' | 'allTime'): void {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (preset === 'thisMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      this.startDate.set(firstDay);
      this.endDate.set(todayStr);
    } else if (preset === 'thisYear') {
      const firstDay = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      this.startDate.set(firstDay);
      this.endDate.set(todayStr);
    } else if (preset === 'allTime') {
      this.startDate.set('2026-01-01');
      this.endDate.set(todayStr);
    }

    this.loadReports();
  }

  setPeriodicView(view: 'monthly' | 'weekly' | 'yearly'): void {
    this.activePeriodicView.set(view);
  }

  getMonthName(monthNum: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return months[monthNum - 1] || `Month ${monthNum}`;
  }

  private showFeedback(type: 'success' | 'error', text: string): void {
    this.feedback.set({ type, text });
    setTimeout(() => {
      this.feedback.set(null);
    }, 4500);
  }
}
