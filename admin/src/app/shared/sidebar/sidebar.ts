import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthServices } from '../../core/services/auth-services';
import { LayoutServices } from '../../core/services/layout-services';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  host: {
    '[class.sidebar-open]': 'isSidebarOpen()',
  },
})
export class Sidebar {
  private authService = inject(AuthServices);
  private layoutService = inject(LayoutServices);
  protected isSidebarOpen = this.layoutService.isSidebarOpen;

  onNavigate(): void {
    // Automatically close off-canvas drawer on mobile navigation
    this.layoutService.closeSidebar();
  }

  onLogout(): void {
    this.layoutService.closeSidebar();
    this.authService.logout();
  }
}


