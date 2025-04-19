import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IBooking } from '../../core/interfaces/ibooking';
import { ICart }    from '../../core/interfaces/icart';
import { IOffers }  from '../../core/interfaces/ioffer';
import { BookingService } from '../../core/services/booking.service';
import { CartService }    from '../../core/services/cart.service';
import { OffersService }  from '../../core/services/offers.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']  // صححت الاسم هنا
})
export class CartComponent implements OnInit {

  private readonly _BookingService = inject(BookingService);
  private readonly _CartService    = inject(CartService);
  private readonly _OfferService   = inject(OffersService);

  bookings: IBooking[] = [];
  cart:     ICart     = {} as ICart;
  offers:   IOffers[] = [];

  ngOnInit(): void {
    // نفترض الـ userId ثابت ١، غيّره للديناميكي إذا عندك AuthService
    const userId = 1;

    // 1) جلب الحجوزات
    this._BookingService.getBookingsByUser(userId).subscribe({
      next: (res) => {
        this.bookings = res;
        console.log('Bookings:', this.bookings);

        // 2) بعد ما ترجع الحجوزات، لكل booking ابعث طلب عرض واحد
        this.bookings.forEach(booking => {
          this._OfferService.getOfferById(booking.offerId).subscribe({
            next: offer => {
              this.offers.push(offer);
              console.log(`Offer for booking ${booking.bookingId}:`, offer);
            },
            error: err => console.error('Error fetching offer:', err)
          });
        });
      },
      error: err => console.error('Error fetching bookings:', err)
    });

    // 3) جلب معلومات السلة
    this._CartService.getCartByUser(userId).subscribe({
      next: (res) => {
        this.cart = res;
        console.log('Cart:', this.cart);
      },
      error: err => console.error('Error fetching cart:', err)
    });
  }
}
