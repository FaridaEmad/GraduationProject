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
  
}
