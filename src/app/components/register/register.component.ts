import { Component, ElementRef, inject, NgModule, OnDestroy, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, RouterLink, ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnDestroy {
  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _AuthService = inject(AuthService);
  private readonly _Router = inject(Router);

  allRegisterSubmit!: Subscription;
  isLoading: boolean = false;
  serverErrorMessage: string | null = null;

  registerForm: FormGroup = this._FormBuilder.group({
    name: [null, [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(20),
      Validators.pattern('^(?=.*[a-zA-Z\u0600-\u06FF])[a-zA-Z\u0600-\u06FF ]+$') // At least one Arabic or English letter, can have spaces
    ]],
    phone: [null, [
      Validators.required,
      Validators.pattern(/^(?!.*(\d)\1{2,})(?:\+20|0)?1[0125]\d{8}$/)
    ]],
    email: [null, [Validators.required, Validators.email , Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) ]],
   password: [null, [
  Validators.required,
  Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/)
]],

    gender: [null, Validators.required],
    profilePhoto: [null, [Validators.required, Validators.pattern(/https?:\/\/.*\.(jpg|jpeg|png|gif)$/i)]]

  });

  

  registerSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.serverErrorMessage = null;

      const formValues = this.registerForm.value;

      const jsonPayload = {
        name: formValues.name,
        phone: formValues.phone,
        email: formValues.email,
        password: formValues.password,
        gender: formValues.gender,
        profilePhoto: formValues.profilePhoto // سيتم إرسال الرابط مباشرة
      };

      this.allRegisterSubmit = this._AuthService.setRegisterForm(jsonPayload).subscribe({
        next: () => {
          console.log('Registered successfully');
          this.isLoading = false;
          this._Router.navigate(['./login']);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          if (err.status === 409 || (typeof err.error === 'string' && err.error.includes('already exists'))) {
            this.serverErrorMessage = 'Account already exists. Please login or use a different email.';
          } else if (typeof err.error === 'string') {
            this.serverErrorMessage = err.error;
          } else {
            this.serverErrorMessage = 'Registration failed. Please try again.';
          }
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }


  @ViewChild('inputPassword') myPassword!: ElementRef;
  @ViewChild('showPasswordIcone') showPasswordIcone!: ElementRef;
  @ViewChild('hidePasswordIcone') hidePasswordIcone!: ElementRef;

  showPassword(): void {
    this.myPassword.nativeElement.setAttribute('type', 'text');
    this.showPasswordIcone.nativeElement.classList.add('d-none');
    this.hidePasswordIcone.nativeElement.classList.remove('d-none');
  }

  hidePassword(): void {
    this.myPassword.nativeElement.setAttribute('type', 'password');
    this.showPasswordIcone.nativeElement.classList.remove('d-none');
    this.hidePasswordIcone.nativeElement.classList.add('d-none');
  }

  ngOnDestroy(): void {
    this.allRegisterSubmit?.unsubscribe();
  }
}