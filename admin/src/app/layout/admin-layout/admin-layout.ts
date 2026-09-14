import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { Topbar } from '../../shared/topbar/topbar';
import { LayoutServices } from '../../core/services/layout-services';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, Sidebar, Topbar],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  private layoutService = inject(LayoutServices);

  protected isSidebarOpen = this.layoutService.isSidebarOpen;

  closeSidebar(): void {
    this.layoutService.closeSidebar();
  }
}


