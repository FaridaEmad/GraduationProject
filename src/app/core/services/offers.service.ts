import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OffersService  {
   //HttpClient
   private readonly _HttpClient=inject(HttpClient)

  //  getAllOffers():Observable<any>{
  //   return this._HttpClient.get(http://localhost:4200/api/Offers/getAllOffers)
  //  }
  getOfferByBesinessId(id:number): Observable<any> {
    return this._HttpClient.get(`https://localhost:7273/api/Offers/getOfferByBusiness/${id}`);
  }
  

  
}