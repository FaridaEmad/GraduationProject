import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookingService } from '../../core/services/booking.service';
import { UserService }    from '../../core/services/user.service';
import { OffersService }  from '../../core/services/offers.service';

import { IBooking } from '../../core/interfaces/ibooking';
import { IUser }    from '../../core/interfaces/iuser';
import { IOffers }  from '../../core/interfaces/ioffer';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {

  /* DATA */
  bookings: IBooking[] = [];
  filteredBookings: IBooking[] = [];
  originalQuantity: number | null = null;


  /* FORM */
  bookingForm: FormGroup;

  /* UI STATE */
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  Math = Math;

  isEditMode = false;
  selectedBookingId: number | null = null;

  @ViewChild('bookingModal') bookingModal!: ElementRef<HTMLDialogElement>;

  constructor(
    private bookingService: BookingService,
    private userService:    UserService,
    private offerService:   OffersService,
    private fb: FormBuilder
  ) {
    this.bookingForm = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
     // Subscribe to quantity changes
    this.bookingForm.get('quantity')?.valueChanges.subscribe(() => {
      this.bookingForm.updateValueAndValidity();
    });
  }

  /* ------------ life-cycle ------------ */
  ngOnInit(): void {
    this.loadBookings();
  }

  /* ------------ LOAD + ENRICH ------------ */
  private loadBookings(): void {
    this.bookingService.getAllBookings().subscribe({
      next: (data) => {
        this.bookings = data;
        this.filteredBookings = [...data];

        // لكل booking نحمّل الإيميل والوصف
        this.bookings.forEach(b => {
          this.userService.getUserById(b.userId).subscribe({
            next: (u: IUser)  => (b as any).userEmail        = u.email,
            error: ()         => (b as any).userEmail        = 'N/A'
          });

          this.offerService.getOfferById(b.offerId).subscribe({
            next: (o: IOffers) => (b as any).offerDescription = o.description,
            error: ()          => (b as any).offerDescription = 'N/A'
          });
        });
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        Swal.fire('Error', 'Failed to load bookings', 'error');
      }
    });
  }

  /* ------------ CRUD ------------ */
  openEditModal(booking: IBooking): void {
    this.isEditMode = true;
    this.selectedBookingId = booking.bookingId;
    this.originalQuantity = booking.quantity;
    this.bookingForm.patchValue({ quantity: booking.quantity });
    this.bookingModal?.nativeElement.showModal();
  }

  closeModal(): void {
    this.bookingModal?.nativeElement.close();
  }

  onSubmit(): void {
    if (this.bookingForm.invalid || !this.selectedBookingId) return;

    const quantity = this.bookingForm.get('quantity')!.value;
    this.bookingService.editBooking(this.selectedBookingId, quantity).subscribe({
      next: (res) => {
        Swal.fire('Success', res, 'success');
        this.closeModal();
        this.loadBookings();
      },
      error: () => Swal.fire('Error', 'Failed to update booking', 'error')
    });
  }

  deleteBooking(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true
    }).then(r => {
      if (r.isConfirmed) {
        this.bookingService.deleteBookingById(id).subscribe({
          next: () => { Swal.fire('Deleted!', '', 'success'); this.loadBookings(); },
          error: () => Swal.fire('Error', 'Failed to delete booking', 'error')
        });
      }
    });
  }

  /* ------------ FILTER ------------ */
  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) { this.filteredBookings = [...this.bookings]; this.currentPage = 1; return; }

    this.filteredBookings = this.bookings.filter(b =>
      b.bookingId.toString().includes(term) ||
      this.getUserEmail(b).toLowerCase().includes(term) ||
      this.getOfferDescription(b).toLowerCase().includes(term) ||
      b.quantity.toString().includes(term)
    );
    this.currentPage = 1;
  }

  /* ------------ PAGINATION helpers ------------ */
  get totalPages(): number { return Math.ceil(this.filteredBookings.length / this.itemsPerPage); }

  get paginatedBookings(): IBooking[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredBookings.slice(start, start + this.itemsPerPage);
  }

  changePage(p: number): void { if (p>=1 && p<=this.totalPages) this.currentPage = p; }

  getPageNumbers(): number[] {
    const total = this.totalPages, cur = this.currentPage, delta = 2, range = [1];
    let start = Math.max(2, cur - delta), end = Math.min(total - 1, cur + delta);
    if (start > 2) range.push(-1);
    for (let i=start;i<=end;i++) range.push(i);
    if (end < total - 1) range.push(-1);
    if (total > 1) range.push(total);
    return range;
  }

   isQuantityChanged(): boolean {
    const currentQuantity = this.bookingForm.get('quantity')?.value;
    return currentQuantity !== this.originalQuantity;
  }

  /* ------------ DISPLAY helpers ------------ */
  getUserEmail(b: IBooking): string  { return (b as any).userEmail        ?? 'Loading…'; }
  getOfferDescription(b: IBooking): string { return (b as any).offerDescription ?? 'Loading…'; }
}