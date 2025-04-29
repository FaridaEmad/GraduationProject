// src/app/services/booking.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly _HttpClient = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7273/api/Booking';  // تأكد من المسار الصحيح للـ API

  // Get bookings by user ID
  getBookingsByUser(userId: number): Observable<any> {
    return this._HttpClient.get<any>(`${this.apiUrl}/getByUser${userId}`);
  }

  // Get all bookings
  getAllBookings(): Observable<any> {
    return this._HttpClient.get<any>(`${this.apiUrl}/getAllBookings`);
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

}
