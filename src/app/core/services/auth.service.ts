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

  // دالة لتسجيل المستخدم
  setRegisterForm(data: object): Observable<any> {
    return this._HttpClient.post('https://localhost:7273/api/Auth/register', data, {
      responseType: 'text' as 'json'
    });
  }

  // دالة لتسجيل الدخول
  setLoginFrom(data: object): Observable<any> {
    return this._HttpClient.post('https://localhost:7273/api/Auth/login', data).pipe(
      tap((res: any) => {
        if (res && res.token) {
          localStorage.setItem('userToken', res.token);  // تخزين التوكن في localStorage
          const decoded: any = jwtDecode(res.token);
          const user = {
            userId: decoded.userId,  // التأكد من وجود userId في الـ token
            name: decoded.unique_name,
            email: decoded.email,
            phone: decoded.phone,
            profilePhoto: decoded.profilePhoto || '',
            isAdmin: decoded.role === 'Admin'
          };
          localStorage.setItem('userData', JSON.stringify(user)); // تخزين بيانات المستخدم في localStorage
          this.userData = user;  // تخزين البيانات في الكلاس المحلي
          if (user.isAdmin) {
            this._Router.navigate(['/admin/home']);
          } else {
            this._Router.navigate(['/user/home']);
          }
        }
      })
    );
  }

  // دالة للحصول على الـ userId من التوكن
  getUserId(): number | null {
    const token = localStorage.getItem('userToken');
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);  // فك التوكن
      return decoded.userId;  // إرجاع الـ userId
    } catch (e) {
      console.error('Failed to decode token:', e);
      return null;
    }
  }

  // دالة لحفظ بيانات المستخدم عند تسجيل الدخول أو التحديث
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

  // دالة للحصول على بيانات المستخدم المخزنة
  getUserData(): any {
    return this.userData; // الآن نستخدم بيانات المستخدم المخزنة في الكلاس مباشرة
  }

  // دالة لتغيير كلمة المرور
  setResetPassword(data: object): Observable<any> {
    const { email, newPassword } = data as any;
    const url = `https://localhost:7273/api/Auth/forgetPassword?email=${encodeURIComponent(email)}&newPass=${encodeURIComponent(newPassword)}`;
    return this._HttpClient.put(url, null, {
      responseType: 'text' as 'json'
    });
  }

  // دالة لتسجيل الخروج
  logOut(): void {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    this.userData = null;
    this._Router.navigate(['/login']);
  }

  // دالة للتحقق إذا كان المستخدم مسجل الدخول
  isUserLoggedIn(): boolean {
    const token = localStorage.getItem('userToken');
    if (!token) {
      return false;
    }

    // التحقق من صلاحية التوكن (على سبيل المثال، يمكن التحقق من تاريخ انتهاء التوكن)
    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000; // الوقت الحالي بالثواني
      if (decoded.exp && decoded.exp < currentTime) {
        // التوكن منتهي الصلاحية
        return false;
      }
      return true; // التوكن صالح
    } catch (e) {
      return false; // إذا كان التوكن غير صالح أو مفقود
    }
  }
}
