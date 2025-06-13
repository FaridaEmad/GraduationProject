import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private baseUrl = 'https://localhost:7273/api';

  constructor(private http: HttpClient) {}

  getAllMethods() {
    console.log('Calling getAllMethods API...');
    return this.http.get(`${this.baseUrl}/PaymentMethod/getAllMethods`).pipe(
      tap(response => console.log('Payment methods API response:', response)),
      catchError(error => {
        console.error('Error fetching payment methods:', error);
        return of([]);
      })
    );
  }

  createPayment(data: any) {
  return this.http.post(`${this.baseUrl}/Paymnet/addNewPayment`, data, { responseType: 'text' });
}


  getPaymentsByUserConfirmed() {
    return this.http.get(`${this.baseUrl}/Payment/getPaymentsByUserConfirmed`);
  }

  getPaymentsByUserPending() {
    return this.http.get(`${this.baseUrl}/Payment/getPaymentsByUserPending`);
  }

  getPaymentsByUserFailed() {
    return this.http.get(`${this.baseUrl}/Payment/getPaymentsByUserFailed`);
  }

  // أضفت هنا دالة لإضافة حجز جديد
  addNewBooking(data: any) {
    return this.http.post(`${this.baseUrl}/Booking/addNewBooking`, data);
  }
}
