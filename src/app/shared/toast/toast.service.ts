import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  toasts: { message: string, type: 'success' | 'error' | 'info', createdAt: Date }[] = [];

  show(message: string, type: 'success' | 'error' | 'info' = 'info', createdAt: Date = new Date()) {
    const toastCreatedAt = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;

    this.toasts.push({ message, type, createdAt: toastCreatedAt });

    

    setTimeout(() => {
      this.toasts.shift();
    }, 5000);
  }

  remove(index: number) {
    this.toasts.splice(index, 1);
  }
}
