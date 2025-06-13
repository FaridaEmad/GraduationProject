import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import {
  IBusiness,
  IBusinessCreate,
  IBusinessUpdate
} from '../interfaces/ibusiness';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  /** حقن الـ HttpClient */
  private readonly http = inject(HttpClient);

  /* ========== 1) كل الأعمال ========== */
  getAllBusiness(): Observable<any[]> {
    return this.http
      .get<any[]>('https://localhost:7273/api/Business/fastAllBusiness')
      .pipe(
        map(businesses =>
          businesses.map(b => ({
            ...b,
            imageUrls:
              typeof b.imageUrls === 'string'
                ? b.imageUrls.split(',')
                : b.imageUrls
          }))
        ),
        catchError(err => {
          console.error('Error fetching all businesses', err);
          return throwError(() => new Error('Error fetching all businesses'));
        })
      );
  }

  /* ========== 2) عمل واحد بالـ ID ========== */
  getOneBusiness(id: number): Observable<any> {
    return this.http
      .get(`https://localhost:7273/api/Business/fastGetById${id}`)
      .pipe(
        catchError(err => {
          console.error(`Error fetching business with id: ${id}`, err);
          return throwError(() => new Error(`Error fetching business with id: ${id}`));
        })
      );
  }

  /* ========== 3) كل الفئات ========== */
  getAllCategories(): Observable<any> {
    return this.http.get('https://localhost:7273/api/Category/getAllCategories');
  }

  /* ========== 4) حسب الفئة ========== */
  getBusinessByCategory(categoryId: number): Observable<any> {
    return this.http.get(`https://localhost:7273/api/Business/fastGetBusinessByCategory${categoryId}`);
  }

  /* ========== 5) حسب المدينة ========== */
  getBusinessByCity(city: string): Observable<any> {
    return this.http.get(
      `https://localhost:7273/api/Business/fastGetBusinessByCity${encodeURIComponent(city)}`
    );
  }

  /* ========== 6) حسب المنطقة ========== */
  getBusinessByArea(area: string): Observable<any> {
    return this.http.get(
      `https://localhost:7273/api/Business/fastGetBusinessByArea${encodeURIComponent(area)}`
    );
  }

  /* ========== 7) فئة + مدينة ========== */
  getBusinessByCategoryAndCity(categoryId: number, city: string): Observable<any> {
    return this.http
      .get(
        `https://localhost:7273/api/Business/fastGetBusinessByCategoryAndCity?id=${categoryId}&city=${encodeURIComponent(city)}`
      )
      .pipe(
        catchError(err => {
          console.error('Error fetching businesses by category and city:', err);
          return of([]);
        })
      );
  }

  /* ========== 8) فئة + منطقة ========== */
  getBusinessByCategoryAndArea(categoryId: number, area: string): Observable<any> {
    return this.http
      .get(
        `https://localhost:7273/api/Business/fastGetBusinessByCategoryAndArea?id=${categoryId}&area=${encodeURIComponent(area)}`
      )
      .pipe(
        catchError(err => {
          console.error('Error fetching businesses by category and area:', err);
          return of([]);
        })
      );
  }

  /* ========== 9) بحث سريع ========== */
  searchItems(keyword: string): Observable<any> {
    return this.http.get(
      `https://localhost:7273/api/Business/fastSearch?keyword=${encodeURIComponent(keyword)}`
    );
  }

  /* ========== 10) إضافة Business ========== */
  addBusiness(business: IBusinessCreate): Observable<string> {
    return this.http
      .post<string>(
        'https://localhost:7273/api/Business/addNewBusiness',
        business,
        { responseType: 'text' as 'json' }
      )
      .pipe(
        catchError(err => {
          console.error('Error adding business:', err);
          return throwError(() => new Error('Failed to add business.'));
        })
      );
  }

  /* ========== 11) حذف Business ========== */
  deleteBusiness(id: number): Observable<string> {
    return this.http
      .delete<string>(
        `https://localhost:7273/api/Business/${id}`,
        { responseType: 'text' as 'json' }
      )
      .pipe(
        catchError(err => {
          console.error(`Error deleting business with id: ${id}`, err);
          return throwError(() => new Error(`Error deleting business with id: ${id}`));
        })
      );
  }

  /* ========== 12) تحديث Business ========== */
  updateBusiness(id: number, business: IBusinessUpdate): Observable<string> {
    return this.http
      .put<string>(
        `https://localhost:7273/api/Business/${id}`,
        business,
        { responseType: 'text' as 'json' }
      )
      .pipe(
        catchError(err => {
          console.error(`Error updating business with id: ${id}`, err);
          return throwError(() => new Error(`Error updating business with id: ${id}`));
        })
      );
  }

  /* ========== صور منفصلة ========== */
  addImage(businessId: number, url: string) {
    return this.http.post(
      'https://localhost:7273/api/Image/addNewImage',
      null,
      { responseType: 'text' as 'json' }
    );
  }

  updateImage(imageId: number, newUrl: string) {
    return this.http.put(
      `https://localhost:7273/api/Image/${imageId}?newImage=${encodeURIComponent(newUrl)}`,
      null,
      { responseType: 'text' as 'json' }
    );
  }

  deleteImage(imageId: number) {
    return this.http.delete(
      `https://localhost:7273/api/Image/${imageId}`,
      { responseType: 'text' as 'json' }
    );
  }
}
