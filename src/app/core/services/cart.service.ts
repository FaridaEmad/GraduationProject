import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly _HttpClient = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7273/api/Cart'; // لاحظ أضفت Cart هنا

  // Get cart by user ID
  getCartByUser(userId: number): Observable<any> {
    return this._HttpClient.get(`${this.apiUrl}/getCartByUser/${userId}`);
  }

  // Get all carts
  getAllCarts(): Observable<any> {
    return this._HttpClient.get(`${this.apiUrl}/getAllCarts`);
  }

  // Get specific cart by ID
  getCartById(id: number): Observable<any> {
    return this._HttpClient.get(`${this.apiUrl}/${id}`);
  }
}
