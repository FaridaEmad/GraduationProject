import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { INotification } from '../interfaces/inotification';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private baseUrl = 'https://localhost:7273/api/Notification';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('userToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllNotifications(): Observable<INotification[]> {
    console.log('Getting all notifications');
    return this.http.get<INotification[]>(`${this.baseUrl}/getAllNotifications`, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => console.log('All notifications response:', response)),
      catchError(error => {
        console.error('Error getting all notifications:', error);
        return of([]);
      })
    );
  }

  getNotificationById(notificationId: number): Observable<INotification> {
    console.log('Getting notification by ID:', notificationId);
    return this.http.get<INotification>(`${this.baseUrl}/${notificationId}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => console.log('Notification response:', response)),
      catchError(error => {
        console.error('Error getting notification:', error);
        throw error;
      })
    );
  }

  createNotification(notification: { message: string, userId: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}/addNewNotification`, notification, {
      headers: this.getHeaders(),
      responseType: 'text'
    }).pipe(
      catchError(error => {
        console.error('Error creating notification:', error);
        throw error;
      })
    );
  }

  updateNotification(id: number, notification: { message: string, userId: number }): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, notification, {
      headers: this.getHeaders(),
      responseType: 'text'
    }).pipe(
      catchError(error => {
        console.error('Error updating notification:', error);
        throw error;
      })
    );
  }

  markAsRead(id: number): Observable<any> {
    console.log('Marking notification as read:', id);
    return this.http.put(`${this.baseUrl}/Read${id}`, {}, {
      headers: this.getHeaders(),
      responseType: 'text'
    }).pipe(
      tap(response => console.log('Mark as read response:', response)),
      catchError(error => {
        console.error('Error marking notification as read:', error);
        if (error.status === 200) {
          return of({ success: true });
        }
        throw error;
      })
    );
  }

  markAllAsRead(ids: number[]): Observable<any> {
    console.log('Marking all notifications as read:', ids);
    if (!ids || ids.length === 0) {
      return of({ success: true });
    }

    const requests = ids.map(id => this.markAsRead(id));
    return forkJoin(requests).pipe(
      map(() => ({ success: true })),
      catchError(error => {
        console.error('Error in markAllAsRead:', error);
        if (error.status === 200) {
          return of({ success: true });
        }
        throw error;
      })
    );
  }

  deleteNotification(id: number): Observable<any> {
    console.log('Deleting notification:', id);
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
      responseType: 'text'
    }).pipe(
      tap(response => console.log('Delete notification response:', response)),
      catchError(error => {
        console.error('Error deleting notification:', error);
        throw error;
      })
    );
  }

  deleteAllNotifications(userId: number): Observable<any> {
    console.log('Deleting all notifications for user:', userId);
    return this.http.delete(`${this.baseUrl}/deleteAll/${userId}`, {
      headers: this.getHeaders(),
      responseType: 'text'
    }).pipe(
      tap(response => console.log('Delete all notifications response:', response)),
      catchError(error => {
        console.error('Error deleting all notifications:', error);
        throw error;
      })
    );
  }
}
