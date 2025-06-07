import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { UserService } from '../../core/services/user.service';
import { INotification } from '../../core/interfaces/inotification';
import { IUser } from '../../core/interfaces/iuser';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-notification-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './notification-management.component.html',
  styleUrls: ['./notification-management.component.scss']
})
export class NotificationManagementComponent implements OnInit {
  notifications: INotification[] = [];
  users: IUser[] = [];
  filteredNotifications: INotification[] = [];
  notificationForm: FormGroup;
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  isEditing: boolean = false;
  editingNotificationId: number | null = null;

  constructor(
    private notificationService: NotificationService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.notificationForm = this.fb.group({
      userId: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadNotifications();
  }

  loadUsers(): void {
    this.userService.getallUsers().subscribe({
      next: (users) => {
        console.log('Received users:', users); // Debug log
        // Filter out admin users and ensure we have valid user objects
        this.users = users.filter(user => 
          user && 
          user.role && 
          user.role.toLowerCase() !== 'admin' &&
          user.userId &&
          user.name
        );
        console.log('Filtered users:', this.users); // Debug log
      },
      error: (err) => {
        console.error('Error loading users:', err);
        Swal.fire('Error', 'Failed to load users', 'error');
      }
    });
  }

  loadNotifications(): void {
    this.notificationService.getAllNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.filterNotifications();
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
        Swal.fire('Error', 'Failed to load notifications', 'error');
      }
    });
  }

  filterNotifications(): void {
    if (!this.searchTerm.trim()) {
      this.filteredNotifications = this.notifications;
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredNotifications = this.notifications.filter(notification => {
        const userName = this.getUserName(notification.userId).toLowerCase();
        const message = notification.message.toLowerCase();
        return userName.includes(searchLower) || message.includes(searchLower);
      });
    }
    this.currentPage = 1; // Reset to first page when filtering
  }

  onSearch(): void {
    this.filterNotifications();
  }

  onSubmit(): void {
    if (this.notificationForm.valid) {
      const notification = this.notificationForm.value;
      
      if (this.isEditing && this.editingNotificationId) {
        this.notificationService.updateNotification(this.editingNotificationId, notification).subscribe({
          next: (response) => {
            if (response === 'Notification updated successfully.') {
              Swal.fire('Success', 'Notification updated successfully', 'success');
              this.resetForm();
              this.loadNotifications();
            } else {
              Swal.fire('Error', 'Failed to update notification', 'error');
            }
          },
          error: (err) => {
            console.error('Error updating notification:', err);
            Swal.fire('Error', 'Failed to update notification', 'error');
          }
        });
      } else {
        this.notificationService.createNotification(notification).subscribe({
          next: (response) => {
            if (response === 'Notification added successfully') {
              Swal.fire('Success', 'Notification sent successfully', 'success');
              this.resetForm();
              this.loadNotifications();
            } else {
              Swal.fire('Error', 'Failed to send notification', 'error');
            }
          },
          error: (err) => {
            console.error('Error sending notification:', err);
            Swal.fire('Error', 'Failed to send notification', 'error');
          }
        });
      }
    }
  }

  editNotification(notification: INotification): void {
    this.isEditing = true;
    this.editingNotificationId = notification.notificationId;
    this.notificationForm.patchValue({
      userId: notification.userId,
      message: notification.message
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.isEditing = false;
    this.editingNotificationId = null;
    this.notificationForm.reset();
  }

  deleteNotification(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This notification will be deleted permanently!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.notificationService.deleteNotification(id).subscribe({
          next: () => {
            Swal.fire('Deleted', 'Notification has been deleted', 'success');
            this.loadNotifications();
          },
          error: (err) => {
            console.error('Error deleting notification:', err);
            Swal.fire('Error', 'Failed to delete notification', 'error');
          }
        });
      }
    });
  }

  get paginatedNotifications(): INotification[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredNotifications.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredNotifications.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getUserName(userId: number): string {
    const user = this.users.find(u => u.userId === userId);
    return user ? user.name : 'Unknown User';
  }
} 