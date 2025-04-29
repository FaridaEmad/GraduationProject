import { Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NgClass, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-forget',
  standalone: true,
  imports: [ReactiveFormsModule,NgIf,NgClass],
  templateUrl: './forget.component.html',
  styleUrl: './forget.component.scss'
})
export class ForgetComponent {
  private readonly _AuthService = inject(AuthService);
  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _Router = inject(Router);

  isLoading: boolean = false;
  msgAlert: string = '';

  changePasswordForm: FormGroup = this._FormBuilder.group({
    email: [null, [Validators.required, Validators.email]],
    newPassword: [null, [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/)]]
  });

  submitChangePassword(): void {
    if (this.changePasswordForm.invalid) return;

    this.isLoading = true;
    this.msgAlert = '';

    this._AuthService.setResetPassword(this.changePasswordForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res === 'Password updated successfully.') {
          this._Router.navigate(['/login']);
        } else {
          this.msgAlert = 'فشل تغيير كلمة المرور.';
        }
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
        this.msgAlert = 'حدث خطأ أثناء الاتصال بالسيرفر.';
      }
    });
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

}
