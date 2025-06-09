import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentService } from '../../core/services/payment.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],  // Removed FormsModule as ReactiveFormsModule is enough
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']  // Changed from .css to .scss
})
export class PaymentComponent implements OnInit {
  paymentForm!: FormGroup;
  paymentMethods: any[] = [];
  totalAmount: number = 0;  // Set to 0 initially, will be updated from cart service
  userId: string = ''; // Will be set dynamically from localStorage or AuthService
  isProcessing: boolean = false;  // Added for loading state
  toastMessage: string | null = null;
  toastType: 'success' | 'error' | null = null;
  toastTimeout: any;

  constructor(
    private cartService: CartService,
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('user-id') || '';  // Fetch userId from localStorage
    this.createForm();
    this.getPaymentMethods();
    this.totalAmount = this.cartService.getTotalAmount();  // Get total amount from cart service
  }

  createForm(): void {
    this.paymentForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      expiry: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\\/([0-9]{2})$')]],
      cvc: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]],
      nameOnCard: ['', [Validators.required, Validators.minLength(3)]],
      country: ['Egypt', Validators.required],
      methodId: ['', Validators.required]
    });
  }

  getPaymentMethods(): void {
    this.paymentService.getAllMethods().subscribe({
      next: (res: any) => {
        this.paymentMethods = res;
      },
      error: (err) => {
        console.error('Failed to fetch payment methods:', err);
      }
    });
  }

  pay(): void {
    if (this.paymentForm.invalid) {
      this.markFormGroupTouched(this.paymentForm);
      return;
    }

    this.isProcessing = true;

    const paymentData = {
      userId: this.userId,
      totalAmount: this.totalAmount,
      methodId: this.paymentForm.value.methodId,
      email: this.paymentForm.value.email,
      cardInfo: {
        cardNumber: this.paymentForm.value.cardNumber,
        expiry: this.paymentForm.value.expiry,
        cvc: this.paymentForm.value.cvc,
        nameOnCard: this.paymentForm.value.nameOnCard,
        country: this.paymentForm.value.country
      }
    };

    this.paymentService.createPayment(paymentData).subscribe({
      next: () => {
        this.isProcessing = false;
        this.showToast('Payment submitted successfully!', 'success');
        setTimeout(() => this.router.navigate(['/user/payments']), 1200);
      },
      error: (err) => {
        this.isProcessing = false;
        this.showToast('Payment failed. Please try again.', 'error');
        console.error('Payment error:', err);
      }
    });
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastMessage = null;
      this.toastType = null;
    }, 2500);
  }

  // Helper method to mark all form controls as touched
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
      void ripple.offsetWidth; // Force reflow to restart animation
      ripple.classList.add('show');
      setTimeout(() => ripple.classList.remove('show'), 600);
    }
  }
}
