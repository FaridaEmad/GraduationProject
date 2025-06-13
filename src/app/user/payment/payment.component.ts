import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentService } from '../../core/services/payment.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import Swal from 'sweetalert2';  // استيراد sweetalert2

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  paymentForm!: FormGroup;
  paymentMethods: any[] = [];
  cartId: number | null = null;
  userId: number | null = null;
  isProcessing: boolean = false;
  showSuccessScreen: boolean = false;
  totalAmount: number = 0;

  constructor(
    private cartService: CartService,
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.extractUserIdFromToken();
    this.totalAmount = this.cartService.getTotalAmount(); 
    this.createForm();
    this.getPaymentMethods();

    if (this.userId) {
      this.cartService.getCartsByUser(this.userId).subscribe({
        next: (carts: any[]) => {
          if (Array.isArray(carts) && carts.length > 0) {
            this.cartId = carts[0].cartId;
          } else {
            this.showAlert('لم يتم العثور على أي عربة لهذا المستخدم.', 'error');
          }
        },
        error: (err) => {
          console.error('Cart fetch error:', err);
          this.showAlert('حدث خطأ أثناء تحميل بيانات العربة.', 'error');
        }
      });
    }
  }

  extractUserIdFromToken(): void {
    const token = localStorage.getItem('userToken');
    if (token) {
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      this.userId = +decodedPayload['nameid'];
    }
  }

  createForm(): void {
    this.paymentForm = this.fb.group({
      methodId: ['', Validators.required]
    });
  }

  getPaymentMethods(): void {
    this.paymentService.getAllMethods().subscribe({
      next: (res: any) => {
        this.paymentMethods = res;
      },
      error: () => {
        this.showAlert('فشل في تحميل وسائل الدفع.', 'error');
      }
    });
  }

  pay(): void {
    if (this.paymentForm.invalid || !this.userId || !this.cartId) {
      this.markFormGroupTouched(this.paymentForm);
      this.showAlert('يجب اختيار وسيلة الدفع ووجود عربة مرتبطة بالمستخدم.', 'error');
      return;
    }

    this.isProcessing = true;

    const paymentData = {
      userId: this.userId,
      cartId: this.cartId,
      paymentMethodId: this.paymentForm.value.methodId
    };

    this.paymentService.createPayment(paymentData).subscribe({
      next: () => {
        this.isProcessing = false;
        this.showSuccessScreen = true;
        this.showAlert('تم إرسال الدفع بنجاح!', 'success');
        setTimeout(() => this.router.navigate(['/user/home']), 3000);
      },
      error: (err) => {
        this.isProcessing = false;
        this.showAlert('فشل الدفع. حاول مرة أخرى.', 'error');
        console.error('Payment error:', err);
      }
    });
  }

  showAlert(message: string, icon: 'success' | 'error') {
    Swal.fire({
      icon: icon,
      title: message,
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
      position: 'top-end',
      toast: true
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  triggerRipple(btn: HTMLElement) {
    const ripple = btn.querySelector('.ripple') as HTMLElement;
    if (ripple) {
      ripple.classList.remove('show');
      void ripple.offsetWidth;
      ripple.classList.add('show');
      setTimeout(() => ripple.classList.remove('show'), 600);
    }
  }
}


