import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IUser } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList implements OnChanges {
  @Input({ required: true }) users: IUser[] = [];
  @Input() total = 0;
  @Input() page = 1;
  @Input() limit = 10;
  @Input() totalPages = 1;
  @Input() isLoading = false;

  @Output() toggleStatus = new EventEmitter<IUser>();
  @Output() toggleRole = new EventEmitter<IUser>();
  @Output() deleteUser = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();

  pages: number[] = [];

  ngOnChanges(): void {
    this.updatePages();
  }

  onToggleStatus(user: IUser): void {
    this.toggleStatus.emit(user);
  }

  onToggleRole(user: IUser): void {
    this.toggleRole.emit(user);
  }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this user account?')) {
      this.deleteUser.emit(id);
    }
  }

  onPageSelect(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages && newPage !== this.page) {
      this.pageChange.emit(newPage);
    }
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  private updatePages(): void {
    const list: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.page - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      list.push(i);
    }
    this.pages = list;
  }
}
