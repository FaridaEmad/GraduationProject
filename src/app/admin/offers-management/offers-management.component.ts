import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { OffersService } from '../../core/services/offers.service';
import { BusinessService } from '../../core/services/business.service';
import Swal from 'sweetalert2'; // استيراد Swal مباشرة
import { IOffers } from '../../core/interfaces/ioffer';
import { IBusiness } from '../../core/interfaces/ibusiness';

@Component({
  selector: 'app-offers-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './offers-management.component.html',
  styleUrls: ['./offers-management.component.scss']
})
export class OffersManagementComponent implements OnInit {

  offers: IOffers[] = [];
  filteredOffers: IOffers[] = [];
  businesses: IBusiness[] = [];
  offerForm!: FormGroup;
  isEdit: boolean = false;
  selectedOfferId: number | null = null;
  // Pagination properties
  currentPage = 1;
  itemsPerPage = 20;
  Math = Math;


  constructor(
    private offersService: OffersService, 
    private businessService: BusinessService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadOffers();
    this.loadBusinesses();
    this.offerForm = this.fb.group({
        startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      discountPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      description: ['', [Validators.required, Validators.minLength(3)]],
      image: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(1)]],
      businessId: [0, [Validators.required, Validators.min(1)]]
    });
  }

  loadOffers() {
    this.offersService.getAllOffers().subscribe((data) => {
      this.offers = data;
       this.filteredOffers = data;
    });
  }

  loadBusinesses() {
    this.businessService.getAllBusiness().subscribe({
      next: (data) => {
        this.businesses = data;
      },
      error: (error) => {
        console.error('Error loading businesses:', error);
        Swal.fire('Error', 'Failed to load businesses', 'error');
      }
    });
  }

  getBusinessName(businessId: number): string {
    const business = this.businesses.find(b => b.businessId === businessId);
    return business ? business.name : 'Unknown Business';
  }

  onSubmit() {
    if (this.offerForm.invalid) {
      // Show validation errors
      Object.keys(this.offerForm.controls).forEach(key => {
        const control = this.offerForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      Swal.fire('Error', 'Please fill all required fields correctly', 'error');
      return;
    }
    const offerData = this.offerForm.value;
    
    if (this.isEdit && this.selectedOfferId !== null) {
      this.offersService.updateOffer(this.selectedOfferId, offerData).subscribe(
        () => {
          this.loadOffers();
          this.resetForm();
           Swal.fire('Success', 'Offer updated successfully', 'success');
        },
        (error) => {
          console.error(error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Something went wrong. Please try again later.',
          });
        }
      );
    } else {
      this.offersService.addNewOffer(offerData).subscribe({
        next:() => {
          this.loadOffers();
          this.resetForm();
          Swal.fire('Success', 'Offer added successfully', 'success');
        },
        error: (error) => {
          console.error('Error adding offer:', error);
          Swal.fire('Error', error.error?.message || 'Failed to add offer', 'error');
        }
      });
    }
  }
   // Get page numbers with ellipsis
  getPageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2; // Number of pages to show on each side of current page
    const range: number[] = [];
    
    // Always show first page
    range.push(1);
    
    // Calculate start and end of page range
    let start = Math.max(2, current - delta);
    let end = Math.min(total - 1, current + delta);
    
    // Add ellipsis after first page if needed
    if (start > 2) {
      range.push(-1);
    }
    
    // Add page numbers around current page
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (end < total - 1) {
      range.push(-1);
    }
    
    // Always show last page if there is more than one page
    if (total > 1) {
      range.push(total);
    }
    
    return range;
  }

  // Get total pages
  get totalPages(): number {
    return Math.ceil(this.filteredOffers.length / this.itemsPerPage);
  }

  // Get paginated offers
  get paginatedOffers(): IOffers[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredOffers.slice(start, start + this.itemsPerPage);
  }

  // Change page
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  editOffer(offer: IOffers) {
    this.isEdit = true;
    this.selectedOfferId = offer.offerId;
    this.offerForm.patchValue({
      startDate: offer.startDate,
      endDate: offer.endDate,
      discountPercentage: offer.discountPercentage,
      description: offer.description,
      image: offer.image,
      price: offer.price,
      businessId: offer.businessId,
    });
  }

  deleteOffer(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.offersService.deleteOffer(id).subscribe(
          () => {
            this.loadOffers();
            Swal.fire('Deleted!', 'Your offer has been deleted.', 'success');
          },
          (error) => {
            Swal.fire('Error!', 'Could not delete offer. It may be in use.', 'error');
          }
        );
      }
    });
  }

  resetForm() {
    this.isEdit = false;
    this.selectedOfferId = null;
    this.offerForm.reset();
  }
}