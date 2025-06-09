import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { IUser } from '../../core/interfaces/iuser';
import { INotification } from '../../core/interfaces/inotification';
import { ToastService } from '../../shared/toast/toast.service';
import { NotificationService } from '../../core/services/notification.service';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { catchError, forkJoin, of, throwError } from 'rxjs';
import { ToastComponent } from "../../shared/toast/toast.component";
import { BookingService } from '../../core/services/booking.service';

@Component({
  selector: 'app-nav-blank',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf, DateFormatPipe, NgFor, CommonModule, NgClass],
  templateUrl: './nav-blank.component.html',
  styleUrl: './nav-blank.component.scss'
})
export class NavBlankComponent implements OnInit {
  private readonly _AuthService = inject(AuthService);
  private readonly __UserService = inject(UserService);

  userPhoto: string = '';
  notifications: INotification[] = [];
  unreadCount = 0;
  userId : number|null = null; 
  cartCount = 0;

  constructor(private router: Router,
     private notificationService: NotificationService,
    private toastService: ToastService,
    private bookingService: BookingService
  ) {
    this.bookingService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });
  }

  ngOnInit(): void {
    // تأكد من أن بيانات المستخدم تم تحميلها من الـ localStorage
     
    this.getNotifications();
    this._AuthService.saveUserData();

    const loggedUser = this._AuthService.getUserData();  // نستخدم بيانات المستخدم من الخدمة

    if (loggedUser && loggedUser.email) {
      this.__UserService.getallUsers().subscribe({
        next: (users: IUser[]) => {
          const currentUser = users.find(u => u.email === loggedUser.email);
          if (currentUser && currentUser.profilePhoto) {
            this.userPhoto = currentUser.profilePhoto;
          } else {
            console.error('No profile photo found for the user.');
          }
        },
        error: err => {
          console.error('Error fetching users:', err);
        }
      });
    }
  }
 getNotifications() {
    this.notificationService.getAllNotifications().subscribe(notifs => {
      const newNotifs = notifs.filter(n => !n.isRead);

      // شغّل الصوت إذا اتسمح وبمجرد وصول أول إشعار جديد
      

      newNotifs.forEach(n => {
        if (!this.notifications.some(e => e.notificationId === n.notificationId)) {
          this.toastService.show(n.message, 'info', n.createdAt);
        }
      });

      this.notifications = [...notifs]; // لإنشاء نسخة جديدة وتحفيز Angular على التحديث

      this.unreadCount = newNotifs.length;
    });
  }


markAllAsRead() {
  const unreadNotifications = this.notifications.filter(n => !n.isRead);
  if (unreadNotifications.length === 0) return;

  const unreadIds = unreadNotifications.map(n => n.notificationId);
  
  this.notificationService.markAllAsRead(unreadIds).subscribe({
    next: () => {
      this.notifications = this.notifications.map(n => ({
        ...n,
        isRead: true
      }));
      this.unreadCount = 0;
      this.toastService.show('All notifications marked as read', 'success', new Date());
    },
    error: (err) => {
      console.error('Error marking notifications as read:', err);
      this.toastService.show('Failed to mark notifications as read', 'error', new Date());
    }
  });
}


deleteNotification(id: number) {
  this.notificationService.deleteNotification(id).subscribe({
    next: () => {
      this.notifications = this.notifications.filter(n => n.notificationId !== id);
      this.unreadCount = this.notifications.filter(n => !n.isRead).length;
      this.toastService.show('Notification deleted', 'success', new Date());
    },
    error: () => {
      this.toastService.show('Failed to delete notification', 'error', new Date());
    }
  });
}


  goToProfile(): void {
    this.router.navigate(['/user/profile']);
  }

  SignOut(): void {
    this._AuthService.logOut();
  }
}
