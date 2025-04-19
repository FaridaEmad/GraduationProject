import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {

  private readonly __HttpClient = inject(HttpClient);

  // جلب كل الأعمال
  getallbusiness(): Observable<any[]> {
    return this.__HttpClient.get<any[]>('https://localhost:7273/api/Business/getAllBusiness').pipe(
      map((businesses) =>
        businesses.map((b) => ({
          ...b,
          imageUrls: typeof b.imageUrls === 'string' ? b.imageUrls.split(',') : b.imageUrls
        }))
      ),
      catchError((error) => {
        console.error('Error fetching all businesses', error);
        return throwError(() => new Error('Error fetching all businesses'));
      })
    );
  }

  // جلب عمل واحد بناءً على الـ ID
  getoneBusiness(id: Number): Observable<any> {
    return this.__HttpClient.get(`http://localhost:7273/api/Business/${id}`).pipe(
      catchError((error) => {
        console.error(`Error fetching business with id: ${id}`, error);
        return throwError(() => new Error(`Error fetching business with id: ${id}`));
      })
    );
  }

  // جلب الأعمال بناءً على الفئة
  getBusinessByCategory(categoryId: number): Observable<any> {
  return this.__HttpClient.get(`https://localhost:7273/api/Business/getBusinessByCategory/${categoryId}`);
}

  

  // جلب الأعمال بناءً على المنطقة
  getBusinessByCity(city: string): Observable<any> {
    return this.__HttpClient.get(`https://localhost:7273/api/Business/getBusinessByCity${city}%20`);
  }
  
  getBusinessByArea(area: string): Observable<any> {
    return this.__HttpClient.get(`https://localhost:7273/api/Business/getBusinessByArea${area}`);
  }
  

  // جلب الأعمال بناءً على الفئة والمدينة
  getBusinessByCategoryAndCity(categoryId: string, city: string): Observable<any> {
    return this.__HttpClient.get(`http://localhost:7273/api/Business/getBusinessByCategoryAndCity?categoryId=${categoryId}&city=${city}`).pipe(
      catchError((error) => {
        console.error(`Error fetching businesses by category and city: ${categoryId}, ${city}`, error);
        return throwError(() => new Error(`Error fetching businesses by category and city: ${categoryId}, ${city}`));
      })
    );
  }

  // جلب الأعمال بناءً على الفئة والمنطقة
  getBusinessByCategoryAndArea(categoryId: string, area: string): Observable<any> {
    return this.__HttpClient.get(`http://localhost:7273/api/Business/getBusinessByCategoryAndArea?categoryId=${categoryId}&area=${area}`).pipe(
      catchError((error) => {
        console.error(`Error fetching businesses by category and area: ${categoryId}, ${area}`, error);
        return throwError(() => new Error(`Error fetching businesses by category and area: ${categoryId}, ${area}`));
      })
    );
  }
}
