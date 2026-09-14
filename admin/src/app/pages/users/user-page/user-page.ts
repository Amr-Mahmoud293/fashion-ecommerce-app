import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserServices } from '../../../core/services/user-services';
import { IUser } from '../../../core/models/user.model';
import { UserList } from '../user-list/user-list';

@Component({
  selector: 'app-user-page',
  imports: [CommonModule, FormsModule, UserList],
  templateUrl: './user-page.html',
  styleUrl: './user-page.css',
})
export class UserPage implements OnInit {
  private userService = inject(UserServices);

  users = signal<IUser[]>([]);
  total = signal<number>(0);
  page = signal<number>(1);
  limit = signal<number>(10);
  totalPages = signal<number>(1);

  isLoading = signal<boolean>(false);
  searchQuery = signal<string>('');
  roleFilter = signal<string>('');
  statusFilter = signal<string>('');
  feedback = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  filteredUsers = computed(() => {
    let list = this.users();
    const query = this.searchQuery().toLowerCase().trim();
    const role = this.roleFilter();
    const status = this.statusFilter();

    if (role) {
      list = list.filter((u) => u.role === role);
    }

    if (status) {
      list = list.filter((u) => u.status === status);
    }

    if (query) {
      list = list.filter((u) => {
        const nameMatch = u.name?.toLowerCase().includes(query);
        const emailMatch = u.email?.toLowerCase().includes(query);
        const phoneMatch = u.phone?.includes(query);
        return !!(nameMatch || emailMatch || phoneMatch);
      });
    }

    return list;
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(pageNumber = this.page()): void {
    this.isLoading.set(true);

    this.userService.getAllUsers({
      page: pageNumber,
      limit: this.limit(),
      sort: 'createdAt',
      order: 'desc',
    }).subscribe({
      next: (res) => {
        this.users.set(res.results || []);
        this.total.set(res.total || 0);
        this.page.set(res.page || 1);
        this.totalPages.set(res.totalPages || 1);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.showFeedback('error', err.error?.message || 'Failed to load users.');
      },
    });
  }

  onPageChange(newPage: number): void {
    this.loadUsers(newPage);
  }

  onStatusToggle(user: IUser): void {
    const newStatus: 'active' | 'blocked' = user.status === 'active' ? 'blocked' : 'active';

    this.userService.updateUserByAdmin(user._id, { status: newStatus }).subscribe({
      next: () => {
        this.users.update((list) =>
          list.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u))
        );
        this.showFeedback(
          'success',
          `User "${user.name}" marked as ${newStatus.toUpperCase()}.`
        );
      },
      error: (err) => {
        this.showFeedback('error', err.error?.message || 'Failed to update user status.');
      },
    });
  }

  onRoleToggle(user: IUser): void {
    const newRole: 'admin' | 'user' = user.role === 'admin' ? 'user' : 'admin';

    this.userService.updateUserByAdmin(user._id, { role: newRole }).subscribe({
      next: () => {
        this.users.update((list) =>
          list.map((u) => (u._id === user._id ? { ...u, role: newRole } : u))
        );
        this.showFeedback(
          'success',
          `User "${user.name}" role updated to ${newRole.toUpperCase()}.`
        );
      },
      error: (err) => {
        this.showFeedback('error', err.error?.message || 'Failed to update user role.');
      },
    });
  }

  onDelete(id: string): void {
    this.userService.deleteUserByAdmin(id).subscribe({
      next: () => {
        this.showFeedback('success', 'User account deleted successfully.');
        this.loadUsers();
      },
      error: (err) => {
        this.showFeedback('error', err.error?.message || 'Failed to delete user.');
      },
    });
  }

  onResetFilters(): void {
    this.searchQuery.set('');
    this.roleFilter.set('');
    this.statusFilter.set('');
  }

  private showFeedback(type: 'success' | 'error', text: string): void {
    this.feedback.set({ type, text });
    setTimeout(() => {
      this.feedback.set(null);
    }, 4500);
  }
}
