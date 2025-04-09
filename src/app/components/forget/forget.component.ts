import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-forget',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './forget.component.html',
  styleUrl: './forget.component.scss'
})
export class ForgetComponent implements OnDestroy{
/*########################################## Inject Services ############################################# */
  private readonly _AuthService = inject(AuthService)
  private readonly _FormBuilder = inject(FormBuilder)
  private readonly _Router = inject(Router)

/*########################################## Global Properties ############################################# */
  step:number = 1
  msgAlert:string = ''
  isLoading:boolean = false
  emailSub!:Subscription
  codeSub!:Subscription
  resetPasswordSub!:Subscription

/*########################################## Verifiy Email Form , Validation And Submit Form ############################################# */
  verifiyEmailInput:FormGroup = this._FormBuilder.group({
    email : [null, [Validators.required, Validators.email]]
  })
  verifiyEmailSubmit():void{
    this.isLoading = true
    let emailValue = this.verifiyEmailInput.get('email')?.value
    this.resetPasswordInput.get('email')?.patchValue(emailValue)

    this.emailSub = this._AuthService.setVerifiyEmail(this.verifiyEmailInput.value).subscribe({
      next:(res)=>{
        console.log(res);
        this.isLoading = false
        if(res.statusMsg == "success"){
          this.step = 2
        }
      },
      error:(err)=>{
        console.log(err);
        this.isLoading = false
      }
    })
  }

/*########################################## Verifiy Code Form , Validation And Submit Form ############################################# */
  verifiyCodeInput:FormGroup = this._FormBuilder.group({
    resetCode : [null, [Validators.required ,Validators.pattern(/^[0-9]{6}$/)]]
  })
  verifiyCodeSubmit():void{
    this.isLoading = true
    this.codeSub = this._AuthService.setVerifyCode(this.verifiyCodeInput.value).subscribe({
      next:(res)=>{
        console.log(res);
        this.isLoading = false
        if(res.status == "Success"){
          this.step = 3
        }
      },
      error:(err:HttpErrorResponse)=>{
        console.log(err);
        this.isLoading = false
      }
    })
  }

/*########################################## Rest Password Form , Validation And Submit Form ############################################# */
  resetPasswordInput:FormGroup = this._FormBuilder.group({
    email : [null, [Validators.required, Validators.email]],
    newPassword : [null, [Validators.required, Validators.pattern(/^\w{6,}$/)]]
  })
  resetPasswordSubmit():void{
    this.isLoading = true
    this.resetPasswordSub = this._AuthService.setResetPassword(this.resetPasswordInput.value).subscribe({
      next:(res)=>{
        console.log(res);
        console.log(res.token);
        this.isLoading = false
        // Save New Token
        localStorage.setItem('userToken', res.token)
        // Navigate To Login
        this._Router.navigate(['/login'])
      },
      error:(err)=>{
        console.log(err);
        this.isLoading = false
      }
    })
  }

/*########################################## Unsubscribe ############################################# */
  ngOnDestroy(): void {
    this.emailSub?.unsubscribe()
    this.codeSub?.unsubscribe()
    this.resetPasswordSub?.unsubscribe()
  }
}
