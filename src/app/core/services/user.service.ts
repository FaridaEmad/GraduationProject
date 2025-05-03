import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUser, IUserCreate } from '../interfaces/iuser';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly __HttpClient = inject(HttpClient);
  getallUsers(): Observable<any[]> {
      return this.__HttpClient.get<any[]>('https://localhost:7273/api/Users/getAllUsers')
        
}
getUserById(id: number): Observable<IUser> {
  return this.__HttpClient.get<IUser>(`https://localhost:7273/api/Users/${id}`);
    
}
deleteUser(id: number): Observable<any> {
  return this.__HttpClient.delete(`https://localhost:7273/api/Users/${id}`, {
    responseType: 'text' as 'json' // ⬅️ عشان يقرا النص "deleted successfuly" صح
  });
}

// تغيير اسم مستخدم
changeUserName(id: number, newName: string): Observable<any> {
  return this.__HttpClient.put(`https://localhost:7273/api/Users/changeName/${id}?newName=${newName}`, {}, {
    responseType: 'text' as 'json' // ⬅️ لو بيرجع نص فقط
  });
}

addAdmin(user: any): Observable<any> {
  const token = localStorage.getItem('token');  // جلب التوكن من localStorage
  return this.__HttpClient.post('/api/Auth/addAdmin', user, {
    headers: new HttpHeaders({ 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`  // إضافة التوكن في الـ header
    })
  });
}


}
