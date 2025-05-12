import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { IUser, IUserCreate } from '../interfaces/iuser';
import Swal from 'sweetalert2';
import { response } from 'express';
import { IPhone } from '../interfaces/iphone';

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
    responseType: 'text' // ⬅️ لو بيرجع نص فقط
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



changeProfilePhoto(userId: number, newPhoto: string): Observable<any> {
  const token = localStorage.getItem('userToken');
  return this.__HttpClient.put(
    `https://localhost:7273/api/Auth/changePhoto/${userId}?newPhoto=${newPhoto}`,
    {},
    {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }),
      responseType: 'text' as 'json' // 👈 أهم تعديل
    }
  ).pipe(
    tap(response => {
      console.log('Photo updated successfully:', response);
      Swal.fire('Updated', 'Profile photo updated successfully!', 'success');
    }),
    catchError(err => {
      console.error('Error updating profile photo:', err);
      Swal.fire('Error', 'Failed to update profile photo.', 'error');
      return throwError(() => err);
    })
  );
}


changePassword(userId: number, newPassword: string): Observable<any> {
  const token = localStorage.getItem('userToken');
  const url = `https://localhost:7273/api/Auth/changePassword/${userId}?newPass=${encodeURIComponent(newPassword)}`;
  

  return this.__HttpClient.put(url, null, {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${token}`
    }),
    responseType: 'text'  // هنا بنحدد أن الرد هيكون نص
  });
}




addNewPhone(userId: number, newPhone: string): Observable<any> {
  const token = localStorage.getItem('userToken');
  return this.__HttpClient.post(
    'https://localhost:7273/api/Phone/addNewPhone',
    { UserId: userId, Number: newPhone },
    {
      headers: new HttpHeaders({ 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }),
      responseType: 'text' as 'json' // 👈 دي أهم تعديل
    }
  ).pipe(
    tap(response => {
      console.log('Phone added successfully:', response);
      Swal.fire('Added', 'New phone number added successfully!', 'success');
    }),
    catchError(err => {
      console.error('Error adding phone number:', err);
      Swal.fire('Error', 'Failed to add phone number.', 'error');
      return throwError(() => err); // 👈 استخدام الدالة بدلًا من throwError(err)
    })
  );
}

updatePhone(phoneId: number, newPhone: string): Observable<any> {
  const token = localStorage.getItem('userToken');
  return this.__HttpClient.put(`https://localhost:7273/api/Phone/${phoneId}?newPhone=${encodeURIComponent(newPhone)}`, null, {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${token}`
    }),
    responseType: 'text' as 'json'
  }).pipe(
    tap(() => {
      Swal.fire('Updated', 'Phone number updated successfully!', 'success');
    }),
    catchError(err => {
      console.error('Error updating phone number:', err);
      Swal.fire('Error', 'Failed to update phone number.', 'error');
      return throwError(err);
    })
  );
}

deletePhone(phoneId: number): Observable<any> {
  const token = localStorage.getItem('userToken');
  return this.__HttpClient.delete(`https://localhost:7273/api/Phone/${phoneId}`, {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${token}`
    }),
    responseType: 'text' as 'json'
  }).pipe(
    tap(() => {
      Swal.fire('Deleted', 'Phone number deleted successfully!', 'success');
    }),
    catchError(err => {
      console.error('Error deleting phone number:', err);
      Swal.fire('Error', 'Failed to delete phone number.', 'error');
      return throwError(err);
    })
  );
}

getPhonesByUserId(userId: number): Observable<IPhone[]> {
  return this.__HttpClient.get<IPhone[]>(`https://localhost:7273/api/Phone/ByUser${userId}`);
}

}
