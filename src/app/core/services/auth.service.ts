import { jwtDecode } from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _HttpClient = inject(HttpClient);
  private readonly _Router = inject(Router);

  userData: any = null;

  setRegisterForm(data: object): Observable<any> {
    return this._HttpClient.post('https://localhost:7273/api/Auth/register', data, {
      responseType: 'text' as 'json'
    });
  }

  setLoginFrom(data: object): Observable<any> {
    return this._HttpClient.post('https://localhost:7273/api/Auth/login', data).pipe(
      tap((res: any) => {
        if (res && res.token) {
          localStorage.setItem('userToken', res.token);
  
          const decoded: any = jwtDecode(res.token);
          const user = {
            name: decoded.unique_name,
            email: decoded.email,
            profilePhoto: decoded.profilePhoto || '',
            isAdmin: decoded.role === 'Admin'
          };
  
          localStorage.setItem('userData', JSON.stringify(user));
          this.userData = user;
  
          // التأكد من أن التوجيه يحدث فقط إذا لم يكن المستخدم مدخلًا إلى الصفحة الصحيحة مسبقًا
          if (user.isAdmin) {
            console.log('user:', user);
console.log('isAdmin?', user.isAdmin);

            this._Router.navigate(['/admin/home']);
          } else {
            this._Router.navigate(['/user/home']);
          }
        }
      })
    );
  }
  
  
  
  
  saveUserData(): void {
    const rawUserData = localStorage.getItem('userData');
    if (rawUserData && rawUserData !== 'undefined') {
      try {
        this.userData = JSON.parse(rawUserData);
      } catch (err) {
        console.error('Failed to parse userData from localStorage', err);
        this.userData = null;
      }
    } else {
      this.userData = null;
    }
  }

  getUserData(): any {
    const storedUser = localStorage.getItem('userData');
    if (storedUser && storedUser !== 'undefined') {
      try {
        return JSON.parse(storedUser);
      } catch (err) {
        console.error('Failed to parse userData from localStorage', err);
        return null;
      }
    }
    return null;
  }

  setResetPassword(data: object): Observable<any> {
    const { email, newPassword } = data as any;
    const url = `https://localhost:7273/api/Auth/forgetPassword?email=${encodeURIComponent(email)}&newPass=${encodeURIComponent(newPassword)}`;
    return this._HttpClient.put(url, null, {
      responseType: 'text' as 'json'
    });
  }
  
 

  

  logOut(): void {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    this.userData = null;
    this._Router.navigate(['/login']);
  }
}
