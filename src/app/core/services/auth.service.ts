import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _HttpClient = inject(HttpClient)
  private readonly _Router = inject(Router)


  userData:string =''

  setRegisterForm(data:object):Observable<any>{
    return this._HttpClient.post('https://ecommerce.routemisr.com/api/v1/auth/signup', data)
  }

  setLoginFrom(data:object):Observable<any>{
    return this._HttpClient.post('https://ecommerce.routemisr.com/api/v1/auth/signin', data)
  }

  saveUserData():void{
    if(localStorage.getItem('userToken') !== null){
      this.userData = jwtDecode( localStorage.getItem('userToken')! )
    }
  }

  setVerifiyEmail(data:object):Observable<any>{
    return this._HttpClient.post('https://ecommerce.routemisr.com/api/v1/auth/forgotPasswords', data)
  }

  setVerifyCode(data:object):Observable<any>{
    return this._HttpClient.post('https://ecommerce.routemisr.com/api/v1/auth/verifyResetCode', data)
  }

  setResetPassword(data:object):Observable<any>{
    return this._HttpClient.put('https://ecommerce.routemisr.com/api/v1/auth/verifyResetCode', data)
  }

  logOut():void{
    localStorage.removeItem('userToken')
    this._Router.navigate(['/login'])
  }


}
