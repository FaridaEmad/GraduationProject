import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { INotification } from '../../core/interfaces/inotification';
import { NotificationService } from '../../core/services/notification.service';
import { ToastService } from '../../shared/toast/toast.service';
import { DateFormatPipe } from '../../pipes/date-format.pipe';

@Component({
  selector: 'app-nav-blank',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf,DateFormatPipe,NgFor],
  templateUrl: './nav-blank.component.html',
  styleUrl: './nav-blank.component.scss'
})
export class NavBlankComponent implements OnInit {
  private readonly _AuthService = inject(AuthService);
  userPhoto: string = '';
   notifications: INotification[] = [];
  unreadCount = 0;
  userId = 36; 

  constructor(private router: Router,
     private notificationService: NotificationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this._AuthService.saveUserData();
    this.getNotifications();
    const user = this._AuthService.getUserData();
    console.log('userPhoto:', this.userPhoto);

    if (user && user.profilePhoto) {
      this.userPhoto = user.profilePhoto;
    }
  }

   getNotifications() {
    this.notificationService.getAllNotifications().subscribe(notifs => {
      this.notifications = notifs;
      const unread = notifs.filter(n => !n.isRead);
      this.unreadCount = unread.length;

      // عرض توست بالإشعارات الجديدة
      unread.forEach(n => {
        this.toastService.show(n.message, 'info', n.createdAt);

      });
    });
  }

  markAllAsRead() {
    this.notifications
      .filter(n => !n.isRead)
      .forEach(n => {
        this.notificationService.markAsRead(n.notificationId).subscribe();
      });
    this.unreadCount = 0;
  }
  goToProfile(): void {
    this.router.navigate(['/user/profile']);
  }

  SignOut(): void {
    this._AuthService.logOut();
  }
}
