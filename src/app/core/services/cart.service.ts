import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  [x: string]: any;
  private readonly _HttpClient = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7273/api/Cart';

  // 🟢 متغير داخلي لتخزين الإجمالي
  private totalAmount: number = 0;

  // 🔹 Setter لحفظ القيمة
  setTotalAmount(amount: number): void {
    this.totalAmount = amount;
  }

  // 🔹 Getter لاسترجاع القيمة
  getTotalAmount(): number {
    return this.totalAmount;
  }

  // 🟢 API Calls

  getCartByUser(userId: number): Observable<any> {
    return this._HttpClient.get(`${this.apiUrl}/getCartByUser/${userId}`);
  }

  getAllCarts(): Observable<any> {
    return this._HttpClient.get(`${this.apiUrl}/getAllCarts`);
  }

  getCartById(id: number): Observable<any> {
    return this._HttpClient.get(`${this.apiUrl}/${id}`);
  }
}