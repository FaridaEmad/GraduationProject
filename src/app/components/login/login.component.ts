import { Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy {
  // Inject Services
  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _AuthService = inject(AuthService);
  private readonly _Router = inject(Router);

  // Global Properties
  isLoading: boolean = false;
  serverErrorMessage: string = '';
  allLoginSubmit?: Subscription;

  // FormGroup and Validation
  loginForm: FormGroup = this._FormBuilder.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/)
    ]]
  });

  // Handle Submit
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
            this._AuthService.saveUserData();
            this._Router.navigate(['/user/home']);
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

  // Show and Hide Password
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

  // Unsubscribe
  ngOnDestroy(): void {
    this.allLoginSubmit?.unsubscribe();
  }
}
