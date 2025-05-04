import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { OffersService } from '../../core/services/offers.service';
import Swal from 'sweetalert2'; // استيراد Swal مباشرة
import { IOffers } from '../../core/interfaces/ioffer';

@Component({
  selector: 'app-offers-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './offers-management.component.html',
  styleUrls: ['./offers-management.component.scss']
})
export class OffersManagementComponent implements OnInit {

  offers: IOffers[] = [];
  offerForm!: FormGroup;
  isEdit: boolean = false;
  selectedOfferId: number | null = null;

  constructor(
    private offersService: OffersService, 
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadOffers();
    this.offerForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      discountPercentage: [0],
      description: [''],
      image: [''],
      price: [0],
      businessId: [0]
    });
  }

  loadOffers() {
    this.offersService.getAllOffers().subscribe((data) => {
      this.offers = data;
    });
  }

  onSubmit() {
    const offerData = this.offerForm.value;
    if (this.isEdit && this.selectedOfferId !== null) {
      this.offersService.updateOffer(this.selectedOfferId, offerData).subscribe(
        () => {
          this.loadOffers();
          this.resetForm();
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
      this.offersService.addNewOffer(offerData).subscribe(
        () => {
          this.loadOffers();
          this.resetForm();
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
      text: 'You won’t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
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
