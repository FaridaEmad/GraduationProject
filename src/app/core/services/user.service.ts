import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly __HttpClient = inject(HttpClient);
  getallUsers(): Observable<any[]> {
      return this.__HttpClient.get<any[]>('https://localhost:7273/api/Users/getAllUsers')
        
}
}
