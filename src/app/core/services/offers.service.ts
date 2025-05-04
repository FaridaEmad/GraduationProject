import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OffersService  {
   //HttpClient
   private readonly _HttpClient=inject(HttpClient)

   getAllOffers(): Observable<any> {
    return this._HttpClient.get(`https://localhost:7273/api/Offers/getAllOffers`);
  }
  
  getOfferByBesinessId(id:number): Observable<any> {
    return this._HttpClient.get(`https://localhost:7273/api/Offers/getOfferByBusiness/${id}`);
  }
  
  getOfferById(id: number): Observable<any> {
    return this._HttpClient.get(`https://localhost:7273/api/Offers/${id}`);
  }


  updateOffer(id: number, offerData: any): Observable<any> {
    return this._HttpClient.put(`https://localhost:7273/api/Offers/${id}`, offerData, { responseType: 'text' });
  }


  deleteOffer(id: number): Observable<any> {
    return this._HttpClient.delete(`https://localhost:7273/api/Offers/${id}`, { responseType: 'text' });
  }

  addNewOffer(offerData: any): Observable<any> {
    return this._HttpClient.post(`https://localhost:7273/api/Offers/addNewOffer`, offerData, { responseType: 'text' });
  }
  
  
}