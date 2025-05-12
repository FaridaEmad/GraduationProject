import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OffersService } from '../../core/services/offers.service';
import { BookingService } from '../../core/services/booking.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { IOffers } from '../../core/interfaces/ioffer';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-offers',
  imports: [CommonModule],
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.scss']
})
export class OfferComponent implements OnInit {

  offersList: IOffers[] = [];
  businessId: number = 0;
  quantities: { [offerId: number]: number } = {};
  addedOfferIds: Set<number> = new Set();
  wishlistIds: Set<number> = new Set();

  constructor(
    private route: ActivatedRoute,
    private _OffersServices: OffersService,
    private _BookingService: BookingService,
    private _WishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.businessId = +params['id'];
        this.getOffers();
        this.loadWishlist(); // جلب المفضلة عند التحميل
      } else {
        console.error('ID parameter is missing from URL');
      }
    });
  }

  extractUserIdFromToken(): number | null {
    const token = localStorage.getItem('userToken');
    if (token) {
      try {
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        return +decodedPayload['nameid'];
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
    return null;
  }

  getOffers(): void {
    this._OffersServices.getOfferByBesinessId(this.businessId).subscribe({
      next: (res) => {
        this.offersList = res;
        this.offersList.forEach(offer => {
          this.quantities[offer.offerId] = 1;
        });
      },
      error: (err) => {
        console.log('Error fetching offers:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load offers. Please try again later.',
        });
      }
    });
  }

  // جلب المفضلة للمستخدم عند تحميل الصفحة
  loadWishlist(): void {
    const userId = this.extractUserIdFromToken();
    if (!userId) return;

    this._WishlistService.getWishlistByUserId(userId).subscribe({
      next: (wishlistOffers) => {
        // إضافة العروض المفضلة إلى الـ wishlistIds
        wishlistOffers.forEach((offer: any) => {
          this.wishlistIds.add(offer.offerId);
        });
      },
      error: (err) => {
        console.error('Error fetching wishlist:', err);
      }
    });
  }

  increaseQuantity(offerId: number): void {
    this.quantities[offerId]++;
  }

  decreaseQuantity(offerId: number): void {
    if (this.quantities[offerId] > 1) {
      this.quantities[offerId]--;
    }
  }

  addToCart(offer: IOffers): void {
    if (this.addedOfferIds.has(offer.offerId)) {
      Swal.fire({
        icon: 'info',
        title: 'Already in Cart!',
        text: 'This offer is already added to your cart.',
        timer: 1500,
        showConfirmButton: false
      });
      return;
    }

    const userId = this.extractUserIdFromToken();
    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'User not logged in',
        text: 'Please log in to add offers to your cart.',
      });
      return;
    }

    const bookingData = {
      offerId: offer.offerId,
      quantity: this.quantities[offer.offerId],
      userId: userId
    };

    this._BookingService.addNewBooking(bookingData).subscribe({
      next: (res: string) => {
        if (res === 'Booking added successfully') {
          this.addedOfferIds.add(offer.offerId);
          Swal.fire({
            icon: 'success',
            title: 'Added to Cart!',
            text: 'The offer has been successfully added to your cart.',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong while adding to cart!',
          });
        }
      },
      error: (err) => {
        console.error('Error adding booking:', err);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong while adding to cart!',
        });
      }
    });
  }

  toggleWishlist(offer: IOffers): void {
    const userId = this.extractUserIdFromToken();
    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'User not logged in',
        text: 'Please log in to manage your wishlist.',
      });
      return;
    }

    if (!this.wishlistIds.has(offer.offerId)) {
      this._WishlistService.addToWishlist(offer.offerId, userId).subscribe({
        next: () => {
          this.wishlistIds.add(offer.offerId); // إضافة العرض إلى المفضلة
          Swal.fire({
            icon: 'success',
            title: 'Added to Wishlist!',
            text: 'Offer added to your wishlist successfully.',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: (err) => {
          console.error('Wishlist error:', err);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Could not add to wishlist!',
          });
        }
      });
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Already in Wishlist',
        text: 'This offer is already in your wishlist.',
      });
    }
  }

  trackByOfferId(index: number, offer: IOffers): number {
    return offer.offerId;
  }
}
