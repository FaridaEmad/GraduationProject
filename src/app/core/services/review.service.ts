import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { IReview } from '../interfaces/ireview';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private baseUrl = 'https://localhost:7273/api/Review';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('userToken');
    if (!token) {
      console.warn('No authentication token found');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Review Service Error:', {
      status: error.status,
      statusText: error.statusText,
      error: error.error,
      message: error.message,
      url: error.url
    });

    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.message || error.message || 'Server error occurred';
    }
    return throwError(() => new Error(errorMessage));
  }

  // GET /api/Review/getReviewsByUser/{userId}
  getReviewsByUser(userId: number): Observable<IReview[]> {
    return this.http.get<IReview[]>(`${this.baseUrl}/getReviewsByUser${userId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // GET /api/Review/getReviewsByBusiness/{businessId}
  getReviewsByBusiness(businessId: number): Observable<IReview[]> {
    return this.http.get<IReview[]>(`${this.baseUrl}/getReviewsByBusiness${businessId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // POST /api/Review/addNewReview
  // Body must be exactly { rating, text, userId, businessId }
  addReview(payload: {
    rating: number;
    text: string;
    userId: number;
    businessId: number;
  }): Observable<any> {
    console.log('Sending review payload:', payload);
    return this.http.post(`${this.baseUrl}/addNewReview`, payload, {
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    }).pipe(
      tap(response => console.log('Review service response:', response)),
      catchError(this.handleError)
    );
  }

  // PUT /api/Review/{reviewId}
  updateReview(
    reviewId: number,
    payload: {
      rating: number;
      text: string;
      userId: number;
      businessId: number;
    }
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/${reviewId}`, payload, {
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    }).pipe(
      tap(response => console.log('Review update response:', response)),
      catchError(this.handleError)
    );
  }

  // DELETE /api/Review/{reviewId}
  deleteReview(reviewId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${reviewId}`, {
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    }).pipe(
      tap(response => console.log('Review delete response:', response)),
      catchError(this.handleError)
    );
  }
}
