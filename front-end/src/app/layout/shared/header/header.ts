import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthServices } from '../../../core/services/auth-services';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  private authService = inject(AuthServices);
  isLoggedIn = false;
  userName!: string;
  isMobileMenuOpen = false;
  searchQuery = '';
  cartCount = 0; 

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLogin();
    this.authService.getUserData().subscribe((name) => {
      this.userName = name || '';
      this.isLoggedIn = this.authService.isLogin();
    });
  }

  logout(): void {
    this.authService.logout();
  }
 
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
  }
}