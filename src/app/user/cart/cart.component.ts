import { Component, OnInit } from '@angular/core';
import { CartService } from '../../core/services/cart.service';
import { OffersService } from '../../core/services/offers.service';
import { BookingService } from '../../core/services/booking.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartData: any;
  bookings: any[] = [];
  offerData: any = {};
  userId: number | null = null;
  totalAmount: number = 0;
  noOfItems: number = 0;
  isActive: boolean = true;

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

  calculateTotalAmount(): void {
    this.totalAmount = 0;
    this.noOfItems = 0;

    const offerRequests = this.bookings.map((booking: any) => {
      return booking.offerId
        ? this.offersService.getOfferById(booking.offerId)
        : null;
    }).filter(request => request !== null);

    if (offerRequests.length > 0) {
      forkJoin(offerRequests).subscribe({
        next: (offers: any[]) => {
          offers.forEach((offer: any, index: number) => {
            this.bookings[index].offer = offer;
            this.totalAmount += offer.price * this.bookings[index].quantity;
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
    console.log('Cart confirmed!');
  }

  deleteBooking(bookingId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'The reservation will be removed from the cart!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookingService.deleteBookingById(bookingId).subscribe({
          next: () => {
            this.bookings = this.bookings.filter(b => b.bookingId !== bookingId);
            this.calculateTotalAmount();
            Swal.fire('Deleted!', 'The reservation was successfully deleted.', 'success');
          },
          error: (err) => {
            console.error(`Error deleting booking ${bookingId}:`, err);
            Swal.fire('Error!', 'An error occurred while deleting the reservation.', 'error');
          }
        });
      }
    });
  }
}
