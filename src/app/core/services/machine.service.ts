// src/app/services/machine.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MachineService {
  private baseUrl = 'https://localhost:7273';
  private http = inject(HttpClient);

  getUserRecommendations(userId: any, numOfRecommends: number = 6): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/Machine/userRecommend?userId=${userId}&numOfRecommends=${numOfRecommends}`);
  }

  getUserRecommendationsWithArea(userId: number, area: string, numOfRecommends: number = 5): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/Machine/userRecommendWithArea?userId=${userId}&area=${area}&numOfRecommends=${numOfRecommends}`);
  }

   getBusinessRecommendations(businessId: number, numOfRecommends: number = 5): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/Machine/businessRecommend?businessID=${businessId}&numOfRecommends=${numOfRecommends}`);
  }
}
