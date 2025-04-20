import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

import { IRegister } from '../interfaces/iregister';
import { ILogin } from '../interfaces/ilogin';
import { IChangePassword } from '../interfaces/ichange-password';
import { IForgotPassword } from '../interfaces/iforget-password';
import { IChangePhoto } from '../interfaces/ichange-photo';
import { IUser } from '../interfaces/iuser';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiBase = 'http://localhost:7273/api'; // عدّل الرابط لو محتاج

  userData: any = '';

  // ✅ التسجيل ويشمل الصورة مباشرة
  setRegisterForm(data: IRegister): Observable<any> {
    return this.http.post(`${this.apiBase}/Auth/register`, data);
  }

  setLoginFrom(data: ILogin): Observable<any> {
    return this.http.post(`${this.apiBase}/Auth/login`, data);
  }

  addAdmin(data: IRegister): Observable<any> {
    return this.http.post(`${this.apiBase}/Auth/addAdmin`, data);
  }

  changePassword(id: number, data: IChangePassword): Observable<any> {
    return this.http.put(`${this.apiBase}/Auth/changePassword/${id}`, data);
  }

  forgetPassword(data: IForgotPassword): Observable<any> {
    return this.http.put(`${this.apiBase}/Auth/forgetPassword`, data);
  }

  changePhoto(id: number, data: IChangePhoto): Observable<any> {
    return this.http.put(`${this.apiBase}/Auth/changePhoto/${id}`, data);
  }

  getAllUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(`${this.apiBase}/Users/getAllUsers`);
  }

  getUserById(id: number): Observable<IUser> {
    return this.http.get<IUser>(`${this.apiBase}/Users/${id}`);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiBase}/Users/${id}`);
  }

  changeUserName(id: number, name: string): Observable<any> {
    return this.http.put(`${this.apiBase}/Users/changeName/${id}`, { name });
  }

  saveUserData(): void {
    const token = localStorage.getItem('userToken');
    if (token !== null) {
      this.userData = jwtDecode(token);
    }
  }

  logOut(): void {
    localStorage.removeItem('userToken');
    this.router.navigate(['/login']);
  }

  // ✅ تم تعديل هذه الدوال لإرسال الطلبات فعليًا

  setVerifiyEmail(data: { email: string }): Observable<any> {
    return this.http.post(`${this.apiBase}/Auth/VerifyEmail`, data);
  }

  setVerifyCode(data: { resetCode: string }): Observable<any> {
    return this.http.post(`${this.apiBase}/Auth/VerifyCode`, data);
  }

  setResetPassword(data: { email: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiBase}/Auth/ResetPassword`, data);
  }
}
