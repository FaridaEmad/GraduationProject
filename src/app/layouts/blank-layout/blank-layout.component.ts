import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { NotificationService } from '../../core/services/notification.service';
import { INotification } from '../../core/interfaces/inotification';
import { Subscription, interval } from 'rxjs';

interface User {
  name: string;
  email: string;
  profilePhoto: string;
  isAdmin: boolean;
  userId?: number;
}

interface JwtPayload {
  nameid: string;
  email: string;
  unique_name: string;
  role: string;
  nbf: number;
  exp: number;
  iat: number;
}

@Component({
  selector: 'app-blank-layout',
  templateUrl: './blank-layout.component.html',
  styleUrls: ['./blank-layout.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class BlankLayoutComponent implements OnInit, OnDestroy {
  cartCount: number = 0;
  userName: string = '';
  userImage: string = '';
  currentYear: number = new Date().getFullYear();
  notifications: INotification[] = [];
  unreadCount: number = 0;
  private subscriptions: Subscription[] = [];
  private currentUserId: number | undefined;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private bookingService: BookingService,
    private notificationService: NotificationService
  ) {}

  private getUserIdFromToken(token: string): number | undefined {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload) as JwtPayload;
      // console.log('Decoded JWT payload:', payload);
      return parseInt(payload.nameid);
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return undefined;
    }
  }

  ngOnInit(): void {
    // Subscribe to cart count changes first
    this.subscriptions.push(
      this.cartService['cartCount$'].subscribe((count: number) => {
        console.log('Cart count updated:', count);
        this.cartCount = count;
      })
    );

    // Get user info from local storage or service
    const userData = localStorage.getItem('userData');
    const token = localStorage.getItem('userToken');
    
    console.log('UserData from localStorage:', userData);
    console.log('Token from localStorage:', token);

    if (userData && token) {
      try {
        const user = JSON.parse(userData) as User;
        console.log('Parsed user:', user);
        
        // Get user info from JWT token
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload) as JwtPayload;
        console.log('JWT payload:', payload);
        
        // Set username from JWT token
        this.userName = payload.unique_name || user.name || 'User';
        this.userImage = user.profilePhoto;
        
        // Get userId from JWT token
        this.currentUserId = parseInt(payload.nameid);
        console.log('Extracted userId from token:', this.currentUserId);
        
        if (this.currentUserId) {
          // Load cart count
          this.cartService.getCartByUser(this.currentUserId).subscribe({
            next: (response) => {
              console.log('Cart loaded:', response);
              if (Array.isArray(response) && response.length > 0) {
                // Directly update the cart count from the response
                this.cartCount = response[0].noOfItems || 0;
                console.log('Updated cart count directly:', this.cartCount);
              }
            },
            error: (error) => {
              console.error('Error loading cart:', error);
              this.cartCount = 0;
            }
          });

          // Load notifications for the current user
          this.loadUserNotifications();
          // Refresh notifications every 30 seconds
          this.subscriptions.push(
            interval(30000).subscribe(() => {
              this.loadUserNotifications();
            })
          );
        } else {
          console.error('Could not extract userId from token');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      console.error('No userData or token found in localStorage');
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadUserNotifications(): void {
    if (!this.currentUserId) {
      console.error('No userId available to load notifications');
      return;
    }

    console.log('Loading notifications for user:', this.currentUserId);
    this.subscriptions.push(
      this.notificationService.getAllNotifications().subscribe({
        next: (allNotifications) => {
          // console.log('Received all notifications:', allNotifications);
          // Filter notifications for current user
          const userNotifications = allNotifications.filter(
            notification => notification.userId === this.currentUserId
          );
          // console.log('Filtered notifications for user:', userNotifications);
          
          if (userNotifications.length > 0) {
            this.notifications = userNotifications;
            this.updateUnreadCount();
          } else {
            console.log('No notifications found for user');
            this.notifications = [];
            this.unreadCount = 0;
          }
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            url: error.url
          });
          if (error.status === 401) {
            console.error('Authentication error - token might be invalid or expired');
          }
        }
      })
    );
  }

  updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => !n.isRead).length;
    console.log('Updated unread count:', this.unreadCount);
  }

  markAsRead(notificationId: number): void {
    const notification = this.notifications.find(n => n.notificationId === notificationId);
    if (notification && !notification.isRead) {
      // console.log('Marking notification as read:', notificationId);
      this.subscriptions.push(
        this.notificationService.markAsRead(notificationId).subscribe({
          next: () => {
            // console.log('Successfully marked notification as read:', notificationId);
            notification.isRead = true;
            this.updateUnreadCount();
          },
          error: (error) => {
            console.error('Error marking notification as read:', error);
          }
        })
      );
    }
  }

  markAllAsRead(): void {
    const unreadIds = this.notifications
      .filter(n => !n.isRead)
      .map(n => n.notificationId);

    if (unreadIds.length > 0) {
      console.log('Marking all notifications as read:', unreadIds);
      this.subscriptions.push(
        this.notificationService.markAllAsRead(unreadIds).subscribe({
          next: () => {
            // console.log('Successfully marked all notifications as read');
            this.notifications.forEach(n => n.isRead = true);
            this.unreadCount = 0;
          },
          error: (error) => {
            console.error('Error marking all notifications as read:', error);
          }
        })
      );
    }
  }

  deleteNotification(notificationId: number): void {
    console.log('Deleting notification:', notificationId);
    this.subscriptions.push(
      this.notificationService.deleteNotification(notificationId).subscribe({
        next: () => {
          console.log('Successfully deleted notification:', notificationId);
          this.notifications = this.notifications.filter(n => n.notificationId !== notificationId);
          this.updateUnreadCount();
        },
        error: (error) => {
          console.error('Error deleting notification:', error);
        }
      })
    );
  }

  logout(): void {
    this.authService.logOut();
  }

  getNotificationIcon(isRead: boolean): string {
    return isRead ? 'read' : 'unread';
  }

  getNotificationIconClass(isRead: boolean): string {
    return isRead ? 'fas fa-check-circle' : 'fas fa-circle';
  }
}
