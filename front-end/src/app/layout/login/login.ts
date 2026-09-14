import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthServices } from '../../core/services/auth-services';
import { CartServices } from '../../core/services/cart-services';
import { ILoginData } from '../../core/models/auth.model';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private authService = inject(AuthServices);
  private cartService = inject(CartServices);
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
      this.router.navigate(['/home']);
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
        // Synchronize guest cart items with the database immediately after successful login
        this.cartService.syncCart().subscribe({
          next: () => {
            this.isLoading = false;
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
            this.router.navigateByUrl(returnUrl);
          },
          error: (err) => {
            console.error('Cart sync error upon login:', err);
            this.isLoading = false;
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
            this.router.navigateByUrl(returnUrl);
          },
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid email or password. Please try again.';
      },
    });
  }
}