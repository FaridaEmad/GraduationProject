import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly _HttpClient = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:7273/api/Wishlist';

  // إضافة عنصر جديد للمفضلة
  addToWishlist(offerId: number, userId: number): Observable<any> {
    const body = {
      offerId,
      userId
    };

    return this._HttpClient.post(`${this.baseUrl}/addNewWishlist`, body, {
      responseType: 'text'
    });
  }

  // جلب المفضلة الخاصة بمستخدم معيّن (قديم)
  getUserWishlist(userId: number): Observable<any> {
    return this._HttpClient.get(`${this.baseUrl}/getByUser/${userId}`);
  }

  // جلب قائمة المفضلة الجديدة باستخدام المسار الجديد
  getWishlistByUserId(userId: number): Observable<any> {
    return this._HttpClient.get(`${this.baseUrl}/getWishlistByUser/${userId}`);
  }

 // حذف عنصر من المفضلة
 removeFromWishlist(id: number): Observable<any> {
  return this._HttpClient.delete(`${this.baseUrl}/${id}`, {
    responseType: 'text'
  });
}

}
