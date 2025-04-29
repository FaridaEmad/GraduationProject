import { Component, OnInit } from '@angular/core';
import { CartService } from '../../core/services/cart.service';
import { OffersService } from '../../core/services/offers.service';
import { BookingService } from '../../core/services/booking.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true, // تأكد من أن الكومبوننت يستخدم بشكل مستقل في حالة Standalone Component
  imports: [
    CommonModule, // تأكد من استيراد CommonModule هنا
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartData: any;
  bookings: any[] = []; // حفظ بيانات الحجوزات
  offerData: any = {}; // حفظ بيانات العرض
  userId: number | null = null;
  totalAmount: number = 0; // لحساب المبلغ الإجمالي
  noOfItems: number = 0; // لحساب عدد العناصر في السلة
  isActive: boolean = true; // تحديد إذا كانت السلة مفعلّة

  constructor(
    private cartService: CartService,
    private offersService: OffersService,
    private bookingService: BookingService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.extractUserIdFromToken();
    if (this.userId) {
      this.getBookingsByUserId();
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

  // جلب الحجوزات باستخدام userId
  getBookingsByUserId(): void {
    this.bookingService.getBookingsByUser(this.userId!).subscribe({
      next: (res) => {
        this.bookings = res;
        this.calculateTotalAmount();
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
      }
    });
  }

  // حساب المبلغ الإجمالي وعدد العناصر في السلة
  calculateTotalAmount(): void {
    this.totalAmount = 0;
    this.noOfItems = 0;

    // هنا نستخدم forkJoin لتنفيذ عدة طلبات متوازية بشكل غير متزامن
    const offerRequests = this.bookings.map((booking: any) => {
      if (booking.offerId) {
        return this.offersService.getOfferById(booking.offerId);
      }
      return null; // إذا لم يكن هناك عرض، نرجع null
    }).filter(request => request !== null); // تصفية القيم null

    if (offerRequests.length > 0) {
      forkJoin(offerRequests).subscribe({
        next: (offers: any[]) => {
          offers.forEach((offer: any, index: number) => {
            this.bookings[index].offer = offer;
            // حساب المجموع الإجمالي
            this.totalAmount += offer.price * this.bookings[index].quantity;
            // حساب عدد العناصر في السلة
            this.noOfItems += this.bookings[index].quantity;
          });
        },
        error: (err) => {
          console.error('Error fetching offers:', err);
        }
      });
    }
  }

  confirmCart(): void {
    // هنا تضع الكود الخاص بتأكيد السلة، مثل إرسال الطلب إلى الخادم أو معالجة الدفع
    console.log('Cart confirmed!');
  }
  
}
