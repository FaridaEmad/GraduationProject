import { Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';
import { Subscription } from 'rxjs';
import { IRegister } from '../../core/interfaces/iregister';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, CommonModule],
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
  base64Image: string = '';

  registerForm: FormGroup = this._FormBuilder.group({
    name: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    phone: [null, [Validators.required, Validators.pattern(/^(?:\+20|0)?1[0125]\d{8}$/)]],
    email: [null, [Validators.required, Validators.email]],
    password: [null, [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/)]],
    rePassword: [null],
    gender: [null, Validators.required],
    profilePhoto: [null]
  }, { validators: this.confirmPassword });

  confirmPassword(g: AbstractControl) {
    return g.get('password')?.value === g.get('rePassword')?.value ? null : { mismatch: true };
  }

  handleImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.base64Image = reader.result as string;
        this.registerForm.patchValue({ profilePhoto: this.base64Image });
      };
      reader.readAsDataURL(file);
    }
  }

  registerSubmit(): void {
    if (this.registerForm.valid) {
        this.isLoading = true;
        this.serverErrorMessage = null;

        const registerData: IRegister = this.registerForm.value;

        this.allRegisterSubmit = this._AuthService.setRegisterForm(registerData).subscribe({
            next: (res) => {
                this.isLoading = false;
                if (res.message === 'success') {
                    this._Router.navigate(['./login']);
                } else {
                    this.serverErrorMessage = 'An unknown error occurred. Please try again.';
                }
            },
            error: (err: HttpErrorResponse) => {
                this.isLoading = false;
                if (err.status === 409 || err.error?.message?.includes('already exists')) {
                    this.serverErrorMessage = 'Account already exists. Please login or use a different email.';
                } else {
                    this.serverErrorMessage = 'Registration failed. Please try again.';
                }
            }
        });
    } else {
        this.registerForm.markAllAsTouched();
        this.registerForm.setErrors({ mismatch: true });
    }

  }

  @ViewChild('inputPassword') myPassword!: ElementRef;
  @ViewChild('inputRepassword') myRepassword!: ElementRef;
  @ViewChild('showPasswordIcone') showPasswordIcone!: ElementRef;
  @ViewChild('hidePasswordIcone') hidePasswordIcone!: ElementRef;
  @ViewChild('showRepasswordIcone') showRepasswordIcone!: ElementRef;
  @ViewChild('hideRepasswordIcone') hideRepasswordIcone!: ElementRef;

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

  showRepassword(): void {
    this.myRepassword.nativeElement.setAttribute('type', 'text');
    this.showRepasswordIcone.nativeElement.classList.add('d-none');
    this.hideRepasswordIcone.nativeElement.classList.remove('d-none');
  }

  hideRepassword(): void {
    this.myRepassword.nativeElement.setAttribute('type', 'password');
    this.showRepasswordIcone.nativeElement.classList.remove('d-none');
    this.hideRepasswordIcone.nativeElement.classList.add('d-none');
  }

  ngOnDestroy(): void {
    this.allRegisterSubmit?.unsubscribe();
  }
}
