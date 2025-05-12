import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private baseUrl = 'https://localhost:7273/api';

  constructor(private http: HttpClient) {}

  getAllMethods() {
    return this.http.get(`${this.baseUrl}/PaymentMethod/getAllMethods`);
  }

  createPayment(data: any) {
    return this.http.post(`${this.baseUrl}/Paymnet/addNewPayment`, data);
  }

  getPaymentsByUserConfirmed() {
    return this.http.get(`${this.baseUrl}/Paymnet/getPaymentsByUserConfirmed`);
  }

  getPaymentsByUserPending() {
    return this.http.get(`${this.baseUrl}/Paymnet/getPaymentsByUserPending`);
  }

  getPaymentsByUserFailed() {
    return this.http.get(`${this.baseUrl}/Paymnet/getPaymentsByUserFailed`);
  }
}
