import { TestBed } from '@angular/core/testing';

import { BusinessService } from './business.service';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private readonly __HttpClient=inject(HttpClient);
  

  getallbusiness():Observable<any>{
    return this.__HttpClient.get('https://ecommerce.routemisr.com/api/v1/products')
  }
  // getoneproduct(id:string | null):Observable<any>{
  //   return this.__HttpClient.get(`${environment.baseUrl}/api/v1/products/${id}`)
  // }
}
