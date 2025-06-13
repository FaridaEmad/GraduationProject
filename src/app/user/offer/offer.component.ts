import { Component, OnInit, ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OffersService } from '../../core/services/offers.service';
import { BookingService } from '../../core/services/booking.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { IOffers } from '../../core/interfaces/ioffer';
import { IBusiness } from '../../core/interfaces/ibusiness';  // تأكد من وجود هذا الملف/الواجهة
import Swal from 'sweetalert2';
import { AddReviewComponent } from '../add-review/add-review.component';
import { MachineService } from '../../core/services/machine.service';  // استيراد سيرفس التوصيات
import { BusinessService } from '../../core/services/business.service';  // سيرفس جلب بيانات البيزنس
import { forkJoin, of } from 'rxjs';
import { catchError, timeout, tap } from 'rxjs/operators';
import { register } from 'swiper/element/bundle';
import { IBooking } from '../../core/interfaces/ibooking';

register();

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule, AddReviewComponent, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.scss']
})
export class OfferComponent implements OnInit, AfterViewInit {

  offersList: IOffers[] = [];
  businessId: number = 0;
  quantities: { [offerId: number]: number } = {};
  addedOfferIds: Set<number> = new Set();
  wishlistIds: Set<number> = new Set();
  wishlist: any[] = [];
  
  recommendedBusinesses: IBusiness[] = []; // مصفوفة التوصيات الجديدة
  isLoadingRelatedBusinesses: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private _OffersServices: OffersService,
    private _BookingService: BookingService,
    private _WishlistService: WishlistService,
    private _MachineService: MachineService,          // إضافة MachineService
    private _BusinessService: BusinessService,        // إضافة BusinessService
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('Component initialized');
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.businessId = +params['id'];
        console.log('Business ID:', this.businessId);
        this.getOffers();
        this.loadWishlist();
        this.loadRecommendedBusinesses();
      } else {
        console.error('ID parameter is missing from URL');
      }
    });
  }

  ngAfterViewInit() {
    this.initializeSwiper();
  }

  private initializeSwiper() {
    const swiperEl = document.querySelector('swiper-container');
    if (swiperEl) {
      const swiperParams = {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoplay: {
          delay: 2000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
          waitForTransition: true
        },
        pagination: {
          clickable: true,
          dynamicBullets: true,
        },
        breakpoints: {
          640: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
        },
        effect: 'slide',
        speed: 1000,
        grabCursor: true
      };

      Object.assign(swiperEl, swiperParams);
      swiperEl.initialize();
    }
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

  loadWishlist(): void {
    console.log('=== Loading Wishlist ===');
    const userId = this.extractUserIdFromToken();
    console.log('User ID:', userId);
    
    if (!userId) {
      console.log('No user ID found, skipping wishlist load');
      return;
    }

    this._WishlistService.getWishlistByUserId(userId).subscribe({
      next: (wishlistOffers) => {
        console.log('Wishlist offers from server:', wishlistOffers);
        this.wishlistIds.clear();
        wishlistOffers.forEach((offer: any) => {
          this.wishlistIds.add(offer.offerId);
          console.log('Added offer to wishlistIds:', offer.offerId);
        });
        console.log('Final wishlistIds state:', Array.from(this.wishlistIds));
      },
      error: (err) => {
        console.error('Error loading wishlist:', err);
      }
    });
  }

  increaseQuantity(offerId: number): void {
    this.quantities[offerId]++;
    this.updateCartQuantity(offerId);
  }

  decreaseQuantity(offerId: number): void {
    if (this.quantities[offerId] > 1) {
      this.quantities[offerId]--;
      this.updateCartQuantity(offerId);
    }
  }

  updateCartQuantity(offerId: number): void {
    if (this.addedOfferIds.has(offerId)) {
      const userId = this.extractUserIdFromToken();
      if (!userId) return;
      const bookingId = this.getBookingIdForOffer(offerId);
      if (!bookingId) return;
      const booking = {
        bookingId: bookingId,
        bookingDate: '',
        quantity: this.quantities[offerId],
        offerId: offerId,
        userId: userId,
        cartId: 0,
        offer: null,
        user: null,
        cart: null
      };
      this._BookingService.editBooking(booking.bookingId, booking.quantity).subscribe({
        next: () => {},
        error: () => {}
      });
    }
  }

  getBookingIdForOffer(offerId: number): number | null {
    return null;
  }

  addToCart(offer: IOffers): void {
    console.log('=== addToCart Process Start ===');
    console.log('Offer:', JSON.stringify(offer, null, 2));

    if (this.addedOfferIds.has(offer.offerId)) {
      console.log('Offer already in cart, skipping...');
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
    console.log('Extracted User ID:', userId);
    
    if (!userId) {
      console.log('No user ID found, user not logged in');
      Swal.fire({
        icon: 'error',
        title: 'User not logged in',
        text: 'Please log in to add offers to your cart.',
      });
      return;
    }

    const bookingData = {
      quantity: this.quantities[offer.offerId] || 1,
      offerId: offer.offerId,
      userId: userId
    };

    console.log('=== Booking Data ===');
    console.log(JSON.stringify(bookingData, null, 2));

    console.log('Calling BookingService.addNewBooking...');
    this._BookingService.addNewBooking(bookingData).subscribe({
      next: (res: string) => {
        console.log('=== Booking Response ===');
        console.log('Response:', res);
        
        if (res === 'Booking added successfully') {
          console.log('Booking successful, updating UI...');
          this.addedOfferIds.add(offer.offerId);
          this._BookingService.incrementCartCount();
          Swal.fire({
            icon: 'success',
            title: 'Added to Cart!',
            text: 'The offer has been successfully added to your cart.',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          console.error('Unexpected response:', res);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong while adding to cart!',
          });
        }
      },
      error: (err) => {
        console.log('=== Booking Error ===');
        console.log('Error Status:', err.status);
        console.log('Error Status Text:', err.statusText);
        console.log('Error Message:', err.message);
        console.log('Full Error:', err);
        
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong while adding to cart!',
        });
      }
    });
  }

  toggleWishlist(offer: IOffers): void {
    console.log('=== Toggle Wishlist ===');
    console.log('Offer ID:', offer.offerId);
    console.log('Current wishlistIds:', Array.from(this.wishlistIds));
    
    const userId = this.extractUserIdFromToken();
    console.log('User ID:', userId);
    
    if (!userId) {
      console.log('No user ID found, showing login message');
      Swal.fire({
        icon: 'error',
        title: 'User not logged in',
        text: 'Please log in to manage your wishlist.',
      });
      return;
    }

    if (!this.wishlistIds.has(offer.offerId)) {
      console.log('Adding to wishlist...');
      this._WishlistService.addToWishlist(offer.offerId, userId).subscribe({
        next: () => {
          console.log('Successfully added to wishlist');
          this.wishlistIds.add(offer.offerId);
          console.log('Updated wishlistIds after adding:', Array.from(this.wishlistIds));
          Swal.fire({
            icon: 'success',
            title: 'Added to Wishlist!',
            text: 'Offer added to your wishlist successfully.',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: (err) => {
          console.error('Error adding to wishlist:', err);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Could not add to wishlist!',
          });
        }
      });
    } else {
      console.log('Removing from wishlist...');
      this._WishlistService.getWishlistByUserId(userId).subscribe({
        next: (wishlistItems) => {
          console.log('Current wishlist items:', wishlistItems);
          const wishlistItem = wishlistItems.find((item: any) => item.offerId === offer.offerId);
          console.log('Found wishlist item:', wishlistItem);
          
          if (wishlistItem && wishlistItem.wishlistId) {
            console.log('Removing wishlist item with ID:', wishlistItem.wishlistId);
            this._WishlistService.removeFromWishlist(wishlistItem.wishlistId).subscribe({
              next: () => {
                console.log('Successfully removed from wishlist');
                this.wishlistIds.delete(offer.offerId);
                console.log('Updated wishlistIds after removing:', Array.from(this.wishlistIds));
                // Force change detection
                this.changeDetectorRef.detectChanges();
                Swal.fire({
                  icon: 'success',
                  title: 'Removed from Wishlist!',
                  text: 'Offer removed from your wishlist successfully.',
                  timer: 1500,
                  showConfirmButton: false
                });
              },
              error: (err) => {
                console.error('Error removing from wishlist:', err);
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: 'Could not remove from wishlist!',
                });
              }
            });
          } else {
            console.log('Wishlist item not found or invalid ID');
            // If we can't find the wishlist item but it's in our local state,
            // remove it from local state anyway
            this.wishlistIds.delete(offer.offerId);
            this.changeDetectorRef.detectChanges();
          }
        },
        error: (err) => {
          console.error('Error fetching wishlist items:', err);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Could not fetch wishlist items!',
          });
        }
      });
    }
  }

  trackByOfferId(index: number, offer: IOffers): number {
    return offer.offerId;
  }

  addMultipleOffersToCart(offers: IOffers[], goToCart: boolean = false): void {
    const userId = this.extractUserIdFromToken();
    if (!userId) return;

    offers.forEach(offer => {
      if (!this.addedOfferIds.has(offer.offerId)) {
        const bookingData = {
          offerId: offer.offerId,
          quantity: this.quantities[offer.offerId],
          userId: userId
        };
        this._BookingService.addNewBooking(bookingData).subscribe({
          next: (res: string) => {
            if (res === 'Booking added successfully') {
              this.addedOfferIds.add(offer.offerId);
              this._BookingService.incrementCartCount();
            }
          }
        });
      }
    });

    if (goToCart) {
      setTimeout(() => {
        this.router.navigate(['/user/cart']);
      }, 500);
    }
  }

  // -----------------------------------
  // دالة تحميل توصيات الأعمال بناءً على businessId فقط
  loadRecommendedBusinesses(): void {
    this.isLoadingRelatedBusinesses = true;
    this._MachineService.getBusinessRecommendations(this.businessId).subscribe({
      next: (recommendations: { businessId: number }[]) => {
        if (!recommendations || recommendations.length === 0) {
          this.recommendedBusinesses = [];
          this.isLoadingRelatedBusinesses = false;
          return;
        }

        const requests = recommendations.map(rec =>
          this._BusinessService.getOneBusiness(rec.businessId).pipe(
            timeout(5000),
            tap(businessArray => console.log(`Loaded business ${rec.businessId}`, businessArray)),
            catchError(err => {
              console.error(`Error loading business id ${rec.businessId}`, err);
              return of(null);
            })
          )
        );

        forkJoin(requests).subscribe({
          next: (businessArrays: (IBusiness[] | null)[]) => {
            const flatBusinesses = businessArrays
              .filter(arr => arr !== null && arr.length > 0)
              .map(arr => arr![0])
              .filter(business => business && business.images && business.images.length > 0);

            this.recommendedBusinesses = flatBusinesses;
            this.isLoadingRelatedBusinesses = false;
            
            // Initialize swiper after data is loaded
            setTimeout(() => {
              this.initializeSwiper();
            }, 100);
          },
          error: err => {
            console.error('Error loading recommended businesses details:', err);
            this.recommendedBusinesses = [];
            this.isLoadingRelatedBusinesses = false;
          }
        });
      },
      error: err => {
        console.error('Error loading business recommendations:', err);
        this.recommendedBusinesses = [];
        this.isLoadingRelatedBusinesses = false;
      }
    });
  }

  trackById(index: number, item: any): number {
    return item.businessId;
  }
}

