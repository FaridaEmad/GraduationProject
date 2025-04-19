import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ICart } from '../interfaces/icart';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // نقطة بداية الـ API
  private apiBase = 'https://localhost:7273/api/Cart';

  constructor(private http: HttpClient) {}

  /** جلب كارت بواسطة معرف الكارت */
  getCartById(id: number): Observable<ICart> {
    return this.http.get<ICart>(`${this.apiBase}/${id}`);
  }

  /** جلب كارت المستخدم الحالي بواسطة معرف المستخدم */
  getCartByUser(userId: number): Observable<any> {
    return this.http.get<ICart>(`${this.apiBase}/getCartByUser/${userId}`);
  }

  /** جلب كل الكارتات */
  getAllCarts(): Observable<ICart[]> {
    return this.http.get<ICart[]>(`${this.apiBase}/getAllCarts`);
  }
}
