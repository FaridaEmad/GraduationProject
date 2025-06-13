// src/app/services/booking.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { IBooking } from '../interfaces/ibooking';
import { catchError } from 'rxjs/operators';
// import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly _HttpClient = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7273/api/Booking';
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor() {}

  // Get bookings by user ID
  getBookingsByUser(userId: number): Observable<any> {
    return this._HttpClient.get<any>(`${this.apiUrl}/getByUser${userId}`);
  }

  // Get all bookings
  getAllBookings(): Observable<any> {
    return this._HttpClient.get<any>(`${this.apiUrl}/getAllBookingss`);
  }

  // Add a new booking
  addNewBooking(bookingData: any) {
    console.log('=== BookingService.addNewBooking ===');
    console.log('API URL:', `${this.apiUrl}/addNewBooking`);
    console.log('Request Data:', JSON.stringify(bookingData, null, 2));
    console.log('Headers:', {
      'Content-Type': 'application/json'
    });

    return this._HttpClient.post(
      `${this.apiUrl}/addNewBooking`,
      bookingData,
      { 
        responseType: 'text',
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    ).pipe(
      tap({
        next: (response) => {
          console.log('=== BookingService Response ===');
          console.log('Status: Success');
          console.log('Response:', response);
        },
        error: (error) => {
          console.log('=== BookingService Error ===');
          console.log('Status:', error.status);
          console.log('Status Text:', error.statusText);
          console.log('Error Message:', error.message);
          console.log('Error Details:', error);
          if (error.error) {
            console.log('Error Response:', error.error);
          }
        }
      })
    );
  }

  // Get booking by ID
  getBookingById(id: number): Observable<any> {
    return this._HttpClient.get<any>(`${this.apiUrl}/${id}`);
  }

  // Delete booking by ID
  deleteBookingById(id: number): Observable<any> {
    return this._HttpClient.delete(`${this.apiUrl}/${id}`, {
      responseType: 'text',
    });
  }

  // Edit Booking
  editBooking(bookingId: number, quantity: number): Observable<any> {
    return this._HttpClient.put(`${this.apiUrl}/editBooking/${bookingId}`, { quantity });
  }

  setCartCount(count: number) {
    this.cartCountSubject.next(count);
  }

  incrementCartCount() {
    const currentCount = this.cartCountSubject.value;
    this.cartCountSubject.next(currentCount + 1);
  }

  decrementCartCount() {
    const currentCount = this.cartCountSubject.value;
    if (currentCount > 0) {
      this.cartCountSubject.next(currentCount - 1);
    }
  }

  getCartCount(): Observable<number> {
    return this.cartCount$;
  }
}
