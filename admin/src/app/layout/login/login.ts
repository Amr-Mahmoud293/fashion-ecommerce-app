import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthServices } from '../../core/services/auth-services';
import { ILoginData } from '../../core/models/auth.model';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private authService = inject(AuthServices);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  isLoading = false;
  errorMessage = '';
  showPassword = false;
  productImageUrl = 'Forest Green Hoodie Product Shot.png';

  ngOnInit(): void {
    if (this.authService.isLogin()) {
      if (this.authService.isAdmin()) {
        this.router.navigate(['/products']);
      } else {
        this.authService.logout();
      }
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  clearField(fieldName: string): void {
    const field = this.loginForm.get(fieldName);
    if (field) {
      field.setValue('');
      field.markAsPristine();
      field.markAsUntouched();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value as ILoginData).subscribe({
      next: () => {
        this.isLoading = false;
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/products';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message === 'Unauthorized: Admin access required.' 
          ? 'Access denied: Administrator privileges required.' 
          : err.error?.message || 'Invalid email or password. Please try again.';
      },
    });
  }
}