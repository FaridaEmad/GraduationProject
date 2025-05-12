import { Component, OnInit } from '@angular/core';
import { WishlistService } from '../../core/services/wishlist.service';
import { OffersService } from '../../core/services/offers.service';
import { BookingService } from '../../core/services/booking.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { IOffers } from '../../core/interfaces/ioffer';
import { Iwishlist } from '../../core/interfaces/iwishlist';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class FavoriteComponent implements OnInit {
  userId: number | null = null;
  wishlistItems: Iwishlist[] = [];
  offersDetails: IOffers[] = [];

  constructor(
    private wishlistService: WishlistService,
    private offersService: OffersService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.extractUserIdFromToken();
    if (this.userId) {
      this.getWishlist();
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

  getWishlist(): void {
    if (this.userId) {
      this.wishlistService.getWishlistByUserId(this.userId).subscribe({
        next: (res) => {
          this.wishlistItems = res;
          this.getOfferDetails();
        },
        error: (err) => {
          console.error('Error fetching wishlist:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load wishlist. Please try again later.',
          });
        }
      });
    }
  }

  getOfferDetails(): void {
    this.offersDetails = [];
    this.wishlistItems.forEach(item => {
      this.offersService.getOfferById(item.offerId).subscribe({
        next: (offer) => {
          this.offersDetails.push(offer);
        },
        error: (err) => {
          console.error('Error fetching offer details:', err);
        }
      });
    });
  }

  addToCart(offerId: number, quantity: number = 1): void {
    if (this.userId) {
      const bookingData = { offerId, quantity, userId: this.userId };
      this.bookingService.addNewBooking(bookingData).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Added to Cart!',
            text: 'The offer has been successfully added to your cart.',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: (err) => {
          console.error('Error adding to cart:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to add offer to cart. Please try again later.',
          });
        }
      });
    }
  }

  getWishlistIdByOfferId(offerId: number): number | null {
    console.log('Searching for offerId:', offerId);
    const item = this.wishlistItems.find(w => w.offerId === offerId);
    console.log('Found item:', item);
    return item ? item.wishlistId : null;
  }

  // removeFromWishlist(wishlistId: number): void {
  //   if (this.userId) {
  //     this.wishlistService.removeFromWishlist(wishlistId).subscribe({
  //       next: () => {
  //         // تحديث wishlistItems و offersDetails بشكل مباشر
  //         this.wishlistItems = this.wishlistItems.filter(item => item.wishlistId !== wishlistId);
  //         this.offersDetails = this.offersDetails.filter(offer =>
  //           this.getWishlistIdByOfferId(offer.offerId) !== wishlistId
  //         );
          
  //         // إظهار رسالة التأكيد
  //         Swal.fire('Removed!', 'The offer was successfully removed from your wishlist.', 'success');
  //       },
  //       error: (err) => {
  //         console.error('Error removing from wishlist:', err);
  //         Swal.fire('Error!', 'An error occurred while removing the offer from the wishlist.', 'error');
  //       }
  //     });
  //   }
  // }

  removeFromWishlist(wishlistId: number): void {
    if (this.userId) {
      this.wishlistService.removeFromWishlist(wishlistId).subscribe({
        next: () => {
          // تحديث البيانات بشكل مباشر بعد إزالة العنصر
          this.wishlistItems = this.wishlistItems.filter(item => item.wishlistId !== wishlistId);
          this.offersDetails = this.offersDetails.filter(offer =>
            this.getWishlistIdByOfferId(offer.offerId) !== wishlistId
          );
          
          // إظهار رسالة التأكيد
          Swal.fire('Removed!', 'The offer was successfully removed from your wishlist.', 'success');
          
          // إعادة تحميل المفضلة بعد إزالة العنصر
          this.getWishlist();  // تحديث البيانات بعد إزالة العنصر
        },
        error: (err) => {
          console.error('Error removing from wishlist:', err);
          Swal.fire('Error!', 'An error occurred while removing the offer from the wishlist.', 'error');
        }
      });
    }
  }
  
}
