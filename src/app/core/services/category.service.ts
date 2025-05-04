import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl = 'https://localhost:7273';

  private readonly __HttpClient= inject(HttpClient);
  getallcategories():Observable<any>{
    return this.__HttpClient.get(`${this.baseUrl}/api/Category/getAllCategories`)
  }
  getBusinessByCategory(categoryId: number): Observable<any> {
    return this.__HttpClient.get(`https://localhost:7273/api/Business/getBusinessByCategory${categoryId}`);
  }
  

  getCategoryById(id: number): Observable<any> {
    return this.__HttpClient.get(`${this.baseUrl}/${id}`);
  }

   // Create a new category
   createCategory(category: any): Observable<any> {
    return this.__HttpClient.post(`${this.baseUrl}/api/Category/addNewCategory`, category, { responseType: 'text' });
  }

  updateCategory(id: number, newName: string): Observable<any> {
    return this.__HttpClient.put(`${this.baseUrl}/api/Category/${id}?newName=${encodeURIComponent(newName)}`, null, {
      responseType: 'text'
    });
  }
  
    // Delete category
    deleteCategory(id: number): Observable<any> {
      return this.__HttpClient.delete(`${this.baseUrl}/api/Category/${id}`, { responseType: 'text' });
    }
}
