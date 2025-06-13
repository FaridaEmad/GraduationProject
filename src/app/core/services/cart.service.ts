import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

interface CartItem {
  id: number;
  quantity: number;
  [key: string]: any;
}

interface CartResponse {
  cartId: number;
  totalAmount: number;
  noOfItems: number;
  isActive: boolean;
  userId: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly _HttpClient = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7273/api/Cart';
  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

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

  // Update cart count
  updateCartCount(count: number): void {
    console.log('Updating cart count to:', count);
    this.cartCountSubject.next(count);
  }
  
getCartsByUser(userId: number): Observable<any> {
  return this._HttpClient.get(`${this.apiUrl}/getCartsByUser${userId}`);
}

  // 🟢 API Calls
  getCartByUser(userId: number): Observable<any> {
    return this._HttpClient.get(`${this.apiUrl}/getCartsByUser${userId}`).pipe(
      tap((response: any) => {
        console.log('Cart response:', response);
        let totalItems = 0;

        if (Array.isArray(response) && response.length > 0) {
          // Use noOfItems from the cart response
          totalItems = response[0].noOfItems || 0;
        }

        console.log('Total items in cart:', totalItems);
        this.updateCartCount(totalItems);
      })
    );
  }

  getAllCarts(): Observable<any> {
    return this._HttpClient.get(`${this.apiUrl}/getAllCarts`);
  }

  getCartById(id: number): Observable<any> {
    return this._HttpClient.get(`${this.apiUrl}/${id}`);
  }

  // Add item to cart
  addToCart(userId: number, item: CartItem): Observable<any> {
    const payload = {
      userId: userId,
      offerId: item.id,
      quantity: item.quantity
    };
    
    return this._HttpClient.post(`${this.apiUrl}/addToCart`, payload).pipe(
      tap(() => {
        // Refresh cart count after adding item
        this.getCartByUser(userId).subscribe();
      })
    );
  }

  // Remove item from cart
  removeFromCart(userId: number, itemId: number): Observable<any> {
    return this._HttpClient.delete(`${this.apiUrl}/removeFromCart/${itemId}`).pipe(
      tap(() => {
        // Refresh cart count after removing item
        this.getCartByUser(userId).subscribe();
      })
    );
  }
}
