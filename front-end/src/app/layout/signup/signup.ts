import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthServices } from '../../core/services/auth-services';
import { PasswordValidator } from '../../core/validators/password.validator';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup implements OnInit {
  private authService = inject(AuthServices);
  private router = inject(Router);

  signupForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      PasswordValidator.strongPassword(),
    ]),
    confirmPassword: new FormControl('', [
      Validators.required,
      PasswordValidator.passwordRetype(),
    ]),
  });

  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  productImageUrl = 'Forest Green Hoodie Product Shot.png';

  ngOnInit(): void {
    if (this.authService.isLogin()) {
      this.router.navigate(['/home']);
    }
    this.signupForm.get('password')?.valueChanges.subscribe(() => {
      this.signupForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  clearField(fieldName: string): void {
    const field = this.signupForm.get(fieldName);
    if (field) {
      field.setValue('');
      field.markAsPristine();
      field.markAsUntouched();
      field.updateValueAndValidity();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const { name, email, password } = this.signupForm.value;

    this.authService
      .register({ name: name!, email: email!, password: password! })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/home']);
        },
       error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      }
      });
  }
}