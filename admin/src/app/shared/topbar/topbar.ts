import { Component, OnInit, inject } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthServices } from '../../core/services/auth-services';
import { LayoutServices } from '../../core/services/layout-services';
import { NotificationServices } from '../../core/services/notification-services';

@Component({
  selector: 'app-topbar',
  imports: [UpperCasePipe, RouterLink],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar implements OnInit {
  private authService = inject(AuthServices);
  private layoutService = inject(LayoutServices);
  private notificationService = inject(NotificationServices);

  unreadCount = this.notificationService.unreadCount;

  ngOnInit(): void {
    this.notificationService.fetchUnreadCount();
  }

  get adminName(): string {
    return this.authService.getUserName();
  }

  get adminRole(): string {
    return this.authService.getUserRole() || 'admin';
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  onLogout(): void {
    this.authService.logout();
  }
}


