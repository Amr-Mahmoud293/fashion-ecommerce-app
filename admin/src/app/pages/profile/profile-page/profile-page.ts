import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserServices } from '../../../core/services/user-services';
import { IUser } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile-page',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserServices);

  profile = signal<IUser | null>(null);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  feedback = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  newAddressInput = signal<string>('');

  profileForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.pattern(/^[0-9]{11}$/)]],
      gender: ['male'],
      age: [null, [Validators.min(18), Validators.max(100)]],
      addresses: this.fb.array([]),
    });
  }

  get addresses(): FormArray {
    return this.profileForm.get('addresses') as FormArray;
  }

  loadProfile(): void {
    this.isLoading.set(true);

    this.userService.getMyProfile().subscribe({
      next: (res) => {
        const user = res.data;
        this.profile.set(user);
        this.populateForm(user);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.showFeedback('error', err.error?.message || 'Failed to load profile.');
      },
    });
  }

  private populateForm(user: IUser): void {
    this.profileForm.patchValue({
      name: user.name || '',
      phone: user.phone || '',
      gender: user.gender || 'male',
      age: user.age || null,
    });

    this.addresses.clear();
    if (user.addresses && user.addresses.length > 0) {
      user.addresses.forEach((addr) => {
        this.addresses.push(this.fb.control(addr, Validators.required));
      });
    }
  }

  addAddress(): void {
    const text = this.newAddressInput().trim();
    if (!text) return;
    this.addresses.push(this.fb.control(text, Validators.required));
    this.newAddressInput.set('');
  }

  removeAddress(index: number): void {
    this.addresses.removeAt(index);
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formVal = this.profileForm.value;

    const payload: Partial<IUser> = {
      name: formVal.name.trim(),
      phone: formVal.phone ? formVal.phone.trim() : undefined,
      gender: formVal.gender,
      age: formVal.age ? Number(formVal.age) : undefined,
      addresses: formVal.addresses.filter((a: string) => a && a.trim().length > 0),
    };

    this.userService.updateMyProfile(payload).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.profile.set(res.data);
        this.showFeedback('success', 'Profile updated successfully!');
      },
      error: (err) => {
        this.isSaving.set(false);
        this.showFeedback('error', err.error?.message || 'Failed to update profile.');
      },
    });
  }

  getInitials(name?: string): string {
    if (!name) return 'AD';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  private showFeedback(type: 'success' | 'error', text: string): void {
    this.feedback.set({ type, text });
    setTimeout(() => {
      this.feedback.set(null);
    }, 4500);
  }
}
