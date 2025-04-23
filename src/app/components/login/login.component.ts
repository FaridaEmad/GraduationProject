import { Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy {
  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _AuthService = inject(AuthService);
  private readonly _Router = inject(Router);

  isLoading: boolean = false;
  serverErrorMessage: string = '';
  allLoginSubmit?: Subscription;

  loginForm: FormGroup = this._FormBuilder.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/)
    ]]
  });

  loginSubmit(): void {
    this.serverErrorMessage = '';
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.allLoginSubmit = this._AuthService.setLoginFrom(this.loginForm.value).subscribe({
        next: (res) => {
          this.isLoading = false;
          console.log('Login Response:', res);
  
          if (res.token) {
            localStorage.setItem("userToken", res.token);
            const decoded: any = jwtDecode(res.token);
  
            const user = {
              name: decoded.unique_name,
              email: decoded.email,
              profilePhoto: decoded.profilePhoto || '',
              isAdmin: decoded.role?.toLowerCase() === 'admin'
            };
  
            console.log('Decoded Token:', decoded);
            console.log('user:', user);
            console.log('isAdmin?', user.isAdmin);
  
            localStorage.setItem('userData', JSON.stringify(user));
  
            if (user.isAdmin) {
              this._Router.navigate(['/admin/home']); // ✅ أدمن
            } else {
              this._Router.navigate(['/user/home']); // ✅ يوزر
            }
          } else {
            this.serverErrorMessage = 'Invalid response from server.';
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.serverErrorMessage = err.error?.message || 'Login failed. Please try again.';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
  

  @ViewChild('inputPassword') inputPassword!: ElementRef;
  @ViewChild('showIcone') showIcon!: ElementRef;
  @ViewChild('hideIcone') hideIcone!: ElementRef;

  show(): void {
    this.inputPassword.nativeElement.setAttribute('type', 'text');
    this.showIcon.nativeElement.classList.add('d-none');
    this.hideIcone.nativeElement.classList.remove('d-none');
  }

  hide(): void {
    this.inputPassword.nativeElement.setAttribute('type', 'password');
    this.showIcon.nativeElement.classList.remove('d-none');
    this.hideIcone.nativeElement.classList.add('d-none');
  }

  ngOnDestroy(): void {
    this.allLoginSubmit?.unsubscribe();
  }
}
