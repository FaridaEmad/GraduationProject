import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-forget',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgClass],
  templateUrl: './forget.component.html',
  styleUrl: './forget.component.scss'
})
export class ForgetComponent implements OnDestroy {
  private readonly _AuthService = inject(AuthService);
  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _Router = inject(Router);

  step: number = 1;
  msgAlert: string = '';
  isLoading: boolean = false;
  emailSub!: Subscription;
  codeSub!: Subscription;
  resetPasswordSub!: Subscription;

  verifiyEmailInput: FormGroup = this._FormBuilder.group({
    email: [null, [Validators.required, Validators.email]]
  });

  verifiyEmailSubmit(): void {
    this.isLoading = true;
    const emailValue = this.verifiyEmailInput.get('email')?.value;
    this.resetPasswordInput.get('email')?.patchValue(emailValue);

    this.emailSub = this._AuthService.setVerifiyEmail(this.verifiyEmailInput.value).subscribe({
      next: (res: any) => {
        console.log(res);
        this.isLoading = false;
        if (res.statusMsg === 'success') {
          this.step = 2;
        }
      },
      error: (err: any) => {
        console.log(err);
        this.isLoading = false;
      }
    });
  }

  verifiyCodeInput: FormGroup = this._FormBuilder.group({
    resetCode: [null, [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
  });

  verifiyCodeSubmit(): void {
    this.isLoading = true;
    this.codeSub = this._AuthService.setVerifyCode(this.verifiyCodeInput.value).subscribe({
      next: (res: any) => {
        console.log(res);
        this.isLoading = false;
        if (res.status === 'Success') {
          this.step = 3;
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
        this.isLoading = false;
      }
    });
  }

  resetPasswordInput: FormGroup = this._FormBuilder.group({
    email: [null, [Validators.required, Validators.email]],
    newPassword: [null, [Validators.required, Validators.pattern(/^\w{6,}$/)]]
  });

  resetPasswordSubmit(): void {
    this.isLoading = true;
    this.resetPasswordSub = this._AuthService.setResetPassword(this.resetPasswordInput.value).subscribe({
      next: (res: any) => {
        console.log(res);
        console.log(res.token);
        this.isLoading = false;
        localStorage.setItem('userToken', res.token);
        this._Router.navigate(['/login']);
      },
      error: (err: any) => {
        console.log(err);
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.emailSub?.unsubscribe();
    this.codeSub?.unsubscribe();
    this.resetPasswordSub?.unsubscribe();
  }
}
