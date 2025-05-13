import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

 toasts: { message: string, type: 'success' | 'error' | 'info', createdAt: Date }[] = [];

show(message: string, type: 'success' | 'error' | 'info' = 'info', createdAt: Date = new Date()) {
  // If createdAt is passed as a string, convert it to Date.
  const toastCreatedAt = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  
  this.toasts.push({ message, type, createdAt: toastCreatedAt });

  const audio = new Audio('assets/notification.mp3');
  audio.play();

  setTimeout(() => this.toasts.shift(), 5000);
}

}
