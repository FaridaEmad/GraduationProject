import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class BookingService {
  constructor(private http: HttpClient) {}

  getAllBookings() : Observable<any>{
    return this.http.get(`http://localhost:7273/api/Booking/getAllBookingss`);
  }

  getBookingById(id: number) : Observable<any>{
    return this.http.get(`http://localhost:7273/api/Booking/${id}`);
  }

  updateBookingQuantity(id: string, count: number): Observable<any> {
    return this.http.put(`http://localhost:7273/api/Booking/${id}` ,{ count });
  }

  deleteBooking(id: string) : Observable<any>{
    return this.http.delete(`http://localhost:7273/api/Booking/${id}`);
  }

  addBooking(offerId: number): Observable<any> {
    return this.http.post('http://localhost:7273/api/Booking/addNewBooking', { offerId });
  }
  

  getBookingsByCart(cartID: string) : Observable<any>{
    return this.http.get(`http://localhost:7273/api/Booking/getByCart${cartID}`);
  }

  getBookingsByUser(userId: number): Observable<any> {
    return this.http.get(`https://localhost:7273/api/Booking/getByUser${userId}`);
  }
}