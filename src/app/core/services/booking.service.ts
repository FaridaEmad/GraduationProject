// src/app/services/booking.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { IBooking } from '../interfaces/ibooking';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly _HttpClient = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7273/api/Booking';  // تأكد من المسار الصحيح للـ API
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  // Get bookings by user ID
  getBookingsByUser(userId: number): Observable<any> {
    return this._HttpClient.get<any>(`${this.apiUrl}/getByUser${userId}`);
  }

  // Get all bookings
  getAllBookings(): Observable<any> {
    return this._HttpClient.get<any>(`${this.apiUrl}/getAllBookingss`);
  }

  // Add a new booking
  // addNewBooking(booking: any): Observable<any> {
  //   return this._HttpClient.post<any>(`${this.apiUrl}/addNewBooking`, booking);
  // }
  addNewBooking(bookingData: any) {
    return this._HttpClient.post('https://localhost:7273/api/Booking/addNewBooking', bookingData, { responseType: 'text' });
  }
  

  // Get booking by ID
  getBookingById(id: number): Observable<any> {
    return this._HttpClient.get<any>(`${this.apiUrl}/${id}`);
  }


  // Delete booking by ID
deleteBookingById(id: number): Observable<any> {
  return this._HttpClient.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
}

//Edit Booking
// في booking.service.ts
editBooking(booking: IBooking): Observable<any> {
  return this._HttpClient.put(`${this.apiUrl}/${booking.bookingId}`,  { responseType: 'text' });
}

setCartCount(count: number) {
  this.cartCountSubject.next(count);
}

incrementCartCount() {
  this.cartCountSubject.next(this.cartCountSubject.value + 1);
}

}
