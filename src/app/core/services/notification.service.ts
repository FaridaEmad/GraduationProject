import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { INotification } from '../interfaces/inotification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private baseUrl = 'https://localhost:7273/api/Notification';

  constructor(private http: HttpClient) {}

  getAllNotifications(): Observable<INotification[]> {
    return this.http.get<INotification[]>(`${this.baseUrl}/getAllNotifications`);
  }

  markAsRead(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/Read${id}`, {});
  }

  markAllAsRead(ids: number[]): void {
    ids.forEach(id => {
      this.markAsRead(id).subscribe();
    });
  }
}
