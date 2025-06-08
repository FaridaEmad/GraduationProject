import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { INotification } from '../interfaces/inotification';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private baseUrl = 'https://localhost:7273/api/Notification';

  constructor(private http: HttpClient) {}

  getAllNotifications(): Observable<INotification[]> {
    return this.http.get<INotification[]>(`${this.baseUrl}/getAllNotifications`);
  }

   getNotificationsByUserId(userId: number): Observable<INotification[]> {
    return this.http.get<INotification[]>(`${this.baseUrl}/getUserNotifications/${userId}`);
  }

  createNotification(notification: { message: string, userId: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}/addNewNotification`, notification, { responseType: 'text' });
  }

  updateNotification(id: number, notification: { message: string, userId: number }): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, notification, { responseType: 'text' });
  }
  markAsRead(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/Read${id}`, {}).pipe(
      catchError(error => {
        if (error.status === 200) {
          return of({ success: true });
        }
        throw error;
      })
    );
  }

  markAllAsRead(ids: number[]): Observable<any> {
    if (!ids || ids.length === 0) {
      return of({ success: true });
    }

    const requests = ids.map(id => this.markAsRead(id));
    return forkJoin(requests).pipe(
      map(() => ({ success: true })),
      catchError(error => {
        console.error('Error in markAllAsRead:', error);
        throw error;
      })
    );
  }

  deleteNotification(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }

  deleteAllNotifications(userId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/deleteAll/${userId}`, { responseType: 'text' });
  }
}
