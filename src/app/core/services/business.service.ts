import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { IBusiness, IBusinessCreate, IBusinessUpdate } from '../interfaces/ibusiness';

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
  getoneBusiness(id: number): Observable<any> {
    return this.__HttpClient.get(`http://localhost:7273/api/Business/${id}`).pipe(
      catchError((error) => {
        console.error(`Error fetching business with id: ${id}`, error);
        return throwError(() => new Error(`Error fetching business with id: ${id}`));
      })
    );
  }
  getallcategories():Observable<any>{
    return this.__HttpClient.get(`https://localhost:7273/api/Category/getAllCategories`)
  }
  // جلب الأعمال بناءً على الفئة
  getBusinessByCategory(categoryId: number): Observable<any> {
  return this.__HttpClient.get(`https://localhost:7273/api/Business/getBusinessByCategory${categoryId}`);
}

  

  // جلب الأعمال بناءً على المنطقة
  getBusinessByCity(city: string): Observable<any> {
    return this.__HttpClient.get(`https://localhost:7273/api/Business/getBusinessByCity${city}%20`);
  }
  
  getBusinessByArea(area: string): Observable<any> {
    return this.__HttpClient.get(`https://localhost:7273/api/Business/getBusinessByArea${area}`);
  }
  

  // جلب الأعمال بناءً على الفئة والمدينة
  // جلب الأعمال بناءً على الفئة والمدينة
getBusinessByCategoryAndCity(categoryId: number, city: string): Observable<any> {
  return this.__HttpClient.get(`https://localhost:7273/api/Business/getBusinessByCategoryAndCity?id=${categoryId}&city=${city}`).pipe(
    catchError((error) => {
      console.error('Error fetching businesses by category and area:', error);
      // رجع رسالة خطأ بدلاً من رمي الخطأ مباشرة
      return of([]);  // رجع مصفوفة فارغة بدلاً من الخطأ
    })
  );
}

// جلب الأعمال بناءً على الفئة والمنطقة
getBusinessByCategoryAndArea(categoryId: number, area: string): Observable<any> {
  return this.__HttpClient.get(`https://localhost:7273/api/Business/getBusinessByCategoryAndArea?id=${categoryId}&area=${area}`).pipe(
    catchError((error) => {
      console.error('Error fetching businesses by category and area:', error);
      // رجع رسالة خطأ بدلاً من رمي الخطأ مباشرة
      return of([]);  // رجع مصفوفة فارغة بدلاً من الخطأ
    })
  );
}



  searchItems(searchText: string) {
    return this.__HttpClient.get(`https://localhost:7273/api/Business/search?keyword=${searchText}`);
  }

  addBusiness(business: IBusinessCreate): Observable<any> {
    return this.__HttpClient.post('https://localhost:7273/api/Business/addNewBusiness', business, {
      responseType: 'text' as 'json'
    }).pipe(
      catchError((error) => {
        console.error('Error adding business:', error);
        return throwError(() => new Error('Failed to add business.'));
      })
    );
  }
      

  deleteBusiness(id: number): Observable<any> {
    return this.__HttpClient.delete(`https://localhost:7273/api/Business/${id}`,{
      responseType: 'text' as 'json'
    }).pipe(
      catchError((error) => {
        console.error(`Error deleting business with id: ${id}`, error);
        return throwError(() => new Error(`Error deleting business with id: ${id}`));
      })
    );
  }

  updateBusiness(id: number, business: IBusinessUpdate): Observable<string> {
    return this.__HttpClient.put<string>(`https://localhost:7273/api/Business/${id}`, business, {
      responseType: 'text' as 'json'
    }).pipe(
      catchError((error) => {
        console.error(`Error updating business with id: ${id}`, error);
        return throwError(() => new Error(`Error updating business with id: ${id}`));
      })
    );
  }
  
}

