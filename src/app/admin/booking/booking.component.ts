import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { BookingService } from '../../core/services/booking.service';
import { IBooking } from '../../core/interfaces/ibooking';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { IUser } from '../../core/interfaces/iuser';
import { IOffers } from '../../core/interfaces/ioffer';
import { OffersService } from '../../core/services/offers.service';
import { CartService } from '../../core/services/cart.service';
import { ICart } from '../../core/interfaces/icart';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
})
export class BookingComponent implements OnInit {
  bookings: IBooking[] = [];
  filteredBookings: IBooking[] = [];
  paginatedBookings: IBooking[] = [];

  usersMap = new Map<number, IUser>();
  offersMap = new Map<number, IOffers>();
  cartsMap = new Map<number, ICart>();

  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;

  searchTerm: string = '';
  sortColumn: keyof IBooking = 'bookingId';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private bookingService: BookingService,
    private userService: UserService,
    private offerService: OffersService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    
    this.fetchBookings();

  }

  fetchBookings(): void {
    this.bookingService.getAllBookings().subscribe({
      next: (data: IBooking[]) => {
        this.bookings = data;
        this.enrichBookings();
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
        Swal.fire('Error', 'An unknown error occurred.', 'error');
      },
    });
  }

  // enrichBookings(): void {
  //   const userIds = [...new Set(this.bookings.map((b) => b.userId))];
  //   const offerIds = [...new Set(this.bookings.map((b) => b.offerId))];
  //   const cartIds = [...new Set(this.bookings.map((b) => b.cartId))];

  //   Promise.all([
  //     ...userIds.map((id) => this.userService.getUserById(id).toPromise()),
  //     ...offerIds.map((id) => this.offerService.getOfferById(id).toPromise()),
  //     ...cartIds.map((id) => this.cartService.getCartById(id).toPromise()),
  //   ])
  //     .then((results) => {
  //       const users = results.slice(0, userIds.length) as IUser[];
  //       const offers = results.slice(userIds.length, userIds.length + offerIds.length) as IOffers[];
  //       const carts = results.slice(userIds.length + offerIds.length) as ICart[];

  //       users.forEach((user) => this.usersMap.set(user.userId, user));
  //       offers.forEach((offer) => this.offersMap.set(offer.offerId, offer));
  //       carts.forEach((cart) => this.cartsMap.set(cart.cartId, cart));

  //       this.bookings.forEach((b) => {
  //         b.user = this.usersMap.get(b.userId) || null;
  //         b.offer = this.offersMap.get(b.offerId) || null;
  //         b.cart = this.cartsMap.get(b.cartId) || null;
  //       });

  //       this.filteredBookings = [...this.bookings];
  //       this.updatePagination();
  //     })
  //     .catch((err) => {
  //       console.error('Error enriching bookings:', err);
  //       Swal.fire('Error', 'Failed to load user, offer, or cart data.', 'error');
  //     });
  // }
// enrichBookings(): void {
//   const userIds = [...new Set(this.bookings.map((b) => b.userId))];
//   console.log('userIds:', userIds); // عرض الـ userIds التي تم جمعها

//   const offerIds = [...new Set(this.bookings.map((b) => b.offerId))];
//   const cartIds = [...new Set(this.bookings.map((b) => b.cartId))];

//   Promise.all([
//     ...userIds.map((id) => this.userService.getUserById(id).toPromise()),
//     ...offerIds.map((id) => this.offerService.getOfferById(id).toPromise()),
//     ...cartIds.map((id) => this.cartService.getCartById(id).toPromise()),
//   ])
//     .then((results) => {
//       console.log('Enriched results:', results); // عرض نتائج التحميل
//       const users = results.slice(0, userIds.length) as IUser[];
//       const offers = results.slice(userIds.length, userIds.length + offerIds.length) as IOffers[];
//       const carts = results.slice(userIds.length + offerIds.length) as ICart[];

//       users.forEach((user) => this.usersMap.set(user.userId, user));
//       offers.forEach((offer) => this.offersMap.set(offer.offerId, offer));
//       carts.forEach((cart) => this.cartsMap.set(cart.cartId, cart));

//       this.bookings.forEach((b) => {
//         b.user = this.usersMap.get(b.userId) || null;
//         console.log('User data for booking:', b.user); // عرض بيانات المستخدم
//         b.offer = this.offersMap.get(b.offerId) || null;
//         b.cart = this.cartsMap.get(b.cartId) || null;
//       });

//       this.filteredBookings = [...this.bookings];
//       this.updatePagination();
//     })
//     .catch((err) => {
//       console.error('Error enriching bookings:', err);
//       Swal.fire('Error', 'Failed to load user, offer, or cart data.', 'error');
//     });
// }
// enrichBookings(): void {
//   const userIds = [...new Set(this.bookings.map((b) => b.userId))];
//   const offerIds = [...new Set(this.bookings.map((b) => b.offerId))];
//   const cartIds = [...new Set(this.bookings.map((b) => b.cartId))];

//   Promise.all([
//     ...userIds.map((id) => this.userService.getUserById(id).toPromise()),
//     ...offerIds.map((id) => this.offerService.getOfferById(id).toPromise()),
//     ...cartIds.map((id) => this.cartService.getCartById(id).toPromise()),
//   ])
//     .then((results) => {
//       const users = results.slice(0, userIds.length) as IUser[];
//       const offers = results.slice(userIds.length, userIds.length + offerIds.length) as IOffers[];
//       const carts = results.slice(userIds.length + offerIds.length) as ICart[];

//       users.forEach((user) => {
//         console.log('User fetched:', user);
//         this.usersMap.set(user.userId, user);
//       });
//       offers.forEach((offer) => this.offersMap.set(offer.offerId, offer));
//       carts.forEach((cart) => this.cartsMap.set(cart.cartId, cart));

//       this.bookings.forEach((b) => {
//         b.user = this.usersMap.get(b.userId) || null;
//         b.offer = this.offersMap.get(b.offerId) || null;
//         b.cart = this.cartsMap.get(b.cartId) || null;
//         console.log('User data for booking:', b.user);
//       });

//       this.filteredBookings = [...this.bookings];
//       this.updatePagination();
//     })
//     .catch((err) => {
//       console.error('Error enriching bookings:', err);
//       Swal.fire('Error', 'Failed to load user, offer, or cart data.', 'error');
//     });
// }
// enrichBookings(): void {
//   const userIds = [...new Set(this.bookings.map((b) => b.userId))];
//   const offerIds = [...new Set(this.bookings.map((b) => b.offerId))];
//   const cartIds = [...new Set(this.bookings.map((b) => b.cartId))];

//   Promise.all([
//     ...userIds.map((id) => this.userService.getUserById(id).toPromise()),
//     ...offerIds.map((id) => this.offerService.getOfferById(id).toPromise()),
//     ...cartIds.map((id) => this.cartService.getCartById(id).toPromise()),
//   ])
//     .then((results) => {
//       const users = results.slice(0, userIds.length) as IUser[];
//       const offers = results.slice(userIds.length, userIds.length + offerIds.length) as IOffers[];
//       const carts = results.slice(userIds.length + offerIds.length) as ICart[];

//       // تجميع البيانات بشكل صحيح في الخرائط
//       users.forEach((user) => {
//         console.log('User fetched:', user);
//         this.usersMap.set(user.userId, user);
//       });
//       offers.forEach((offer) => this.offersMap.set(offer.offerId, offer));
//       carts.forEach((cart) => this.cartsMap.set(cart.cartId, cart));

//       // ربط الحجز بالمستخدم والعرض والعربة
//       this.bookings.forEach((b) => {
//         b.user = this.usersMap.get(b.userId) || null;
//         b.offer = this.offersMap.get(b.offerId) || null;
//         b.cart = this.cartsMap.get(b.cartId) || null;

//         // طباعة بيانات المستخدم بعد ربطها
//         console.log('User data for booking:', b.user);
//       });

//       this.filteredBookings = [...this.bookings];
//       this.updatePagination();
//     })
//     .catch((err) => {
//       console.error('Error enriching bookings:', err);
//       Swal.fire('Error', 'Failed to load user, offer, or cart data.', 'error');
//     });
// }
enrichBookings(): void {
  const userIds = [...new Set(this.bookings.map((b) => b.userId))];
  const offerIds = [...new Set(this.bookings.map((b) => b.offerId))];
  const cartIds = [...new Set(this.bookings.map((b) => b.cartId))];

  console.log('User IDs:', userIds);
  console.log('Offer IDs:', offerIds);
  console.log('Cart IDs:', cartIds);

  const userRequests = userIds.map((id) => this.userService.getUserById(id).toPromise());
  const offerRequests = offerIds.map((id) => this.offerService.getOfferById(id).toPromise());
  const cartRequests = cartIds.map((id) => this.cartService.getCartById(id).toPromise());

  Promise.all([...userRequests, ...offerRequests, ...cartRequests])
    .then((results) => {
      const users = results.slice(0, userIds.length) as IUser[];
      const offers = results.slice(userIds.length, userIds.length + offerIds.length) as IOffers[];
      const carts = results.slice(userIds.length + offerIds.length) as ICart[];

      // ربط المستخدمين بالمفاتيح المناسبة بناءً على الترتيب
      users.forEach((user, index) => {
        const id = userIds[index];
        this.usersMap.set(id, { ...user, userId: id });  // نحفظ الـ id من الخارج
        console.log('User fetched:', { ...user, userId: id });
      });

      offers.forEach((offer, index) => {
        const id = offerIds[index];
        this.offersMap.set(id, offer);
      });

      carts.forEach((cart, index) => {
        const id = cartIds[index];
        this.cartsMap.set(id, cart);
      });

      this.bookings.forEach((b) => {
        b.user = this.usersMap.get(b.userId) || null;
        b.offer = this.offersMap.get(b.offerId) || null;
        b.cart = this.cartsMap.get(b.cartId) || null;
        console.log('User data for booking:', b.user);
      });

      this.filteredBookings = [...this.bookings];
      this.updatePagination();
    })
    .catch((err) => {
      console.error('Error enriching bookings:', err);
      Swal.fire('Error', 'Failed to load user, offer, or cart data.', 'error');
    });
}


  filterBookings(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredBookings = this.bookings.filter(
      (b) =>
        b.user?.name?.toLowerCase().includes(term) ||
        b.offer?.description?.toLowerCase().includes(term) ||
        b.cart?.cartId?.toString().includes(term)
    );
    this.currentPage = 1;
    this.updatePagination();
  }

  sortBookings(column: keyof IBooking): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredBookings.sort((a: IBooking, b: IBooking) => {
      let aVal: string | number | null | undefined;
      let bVal: string | number | null | undefined;

      switch (column) {
        case 'user':
          aVal = a.user?.name;
          bVal = b.user?.name;
          break;
        case 'offer':
          aVal = a.offer?.description;
          bVal = b.offer?.description;
          break;
        case 'cart':
          aVal = a.cart?.cartId;
          bVal = b.cart?.cartId;
          break;
        default:
          aVal = a[column] as string | number | null | undefined;
          bVal = b[column] as string | number | null | undefined;
          break;
      }

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredBookings.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedBookings = this.filteredBookings.slice(startIndex, startIndex + this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  deleteBooking(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This booking will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookingService.deleteBookingById(id).subscribe({
          next: () => {
            this.bookings = this.bookings.filter((b) => b.bookingId !== id);
            this.filterBookings();
            Swal.fire('Deleted!', 'The booking has been deleted.', 'success');
          },
          error: (err) => {
            console.error('Error deleting booking:', err);
            Swal.fire('Error!', 'There was an issue deleting the booking.', 'error');
          },
        });
      }
    });
  }

 editBooking(booking: IBooking): void {
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to save the changes to this booking?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, save it!',
    cancelButtonText: 'Cancel',
  }).then((result) => {
    if (result.isConfirmed) {
      this.bookingService.editBooking(booking).subscribe({
        next: () => {
          Swal.fire('Updated!', 'The booking has been updated successfully.', 'success');
          this.fetchBookings(); // إعادة تحميل البيانات للتحديث
        },
        error: (err) => {
          console.error('Error updating booking:', err);
          Swal.fire('Error', 'Failed to update the booking.', 'error');
        },
      });
    }
  });
}

}
