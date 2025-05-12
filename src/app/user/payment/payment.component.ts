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
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  paymentForm!: FormGroup;
  paymentMethods: any[] = [];
  totalAmount: number = 0;  // Set to 0 initially, will be updated from cart service
  userId: string = ''; // Will be set dynamically from localStorage or AuthService

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
      cardNumber: ['', Validators.required],
      expiry: ['', Validators.required],
      cvc: ['', Validators.required],
      nameOnCard: ['', Validators.required],
      country: ['Egypt', Validators.required],
      methodId: ['', Validators.required]
    });
  }

  getPaymentMethods(): void {
    this.paymentService.getAllMethods().subscribe((res: any) => {
      this.paymentMethods = res;
      
    });
    
  }

  pay(): void {
    if (this.paymentForm.invalid) return;

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
        alert('Payment submitted successfully!');
        this.router.navigate(['/user/payments']);
      },
      error: (err) => {
        alert('Payment failed');
        console.error(err);
      }
    });
  }
}
