import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';

import { ReviewService } from '../../core/services/review.service';
import { IReview } from '../../core/interfaces/ireview';

interface CustomJwtPayload {
  nameid: string;
  email: string;
  unique_name: string;
  role: string;
  nbf: number;
  exp: number;
  iat: number;
}

@Component({
  selector: 'app-add-review',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-review.component.html',
  styleUrls: ['./add-review.component.css']
})
export class AddReviewComponent implements OnInit {
  reviewForm: FormGroup;
  reviews: IReview[] = [];
  isEdit = false;
  selectedReviewId: number | null = null;
  businessId!: number;
  userId!: number;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Initialize the form in the constructor
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      text: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    // Get business ID from route params
    this.route.params.subscribe(params => {
      this.businessId = +params['id'];
      if (!this.businessId) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Business ID is required'
        });
        this.router.navigate(['/']);
        return;
      }
      this.loadAllReviews();
    });

    // Get user ID from token
    const token = localStorage.getItem('userToken');
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Required',
        text: 'Please log in to add a review'
      });
      this.router.navigate(['/login']);
      return;
    }

    try {
      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      this.userId = +decodedToken.nameid;
      if (!this.userId) {
        throw new Error('Invalid user ID in token');
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      Swal.fire({
        icon: 'error',
        title: 'Authentication Error',
        text: 'Please log in again'
      });
      this.router.navigate(['/login']);
    }
  }

  private loadAllReviews(): void {
    if (!this.businessId || this.businessId === 0) {
      console.warn('Invalid businessId:', this.businessId);
      return;
    }

    this.reviewService.getReviewsByBusiness(this.businessId).subscribe({
      next: (allReviews: IReview[]) => {
        this.reviews = allReviews;
        this.isEdit = false;
        this.selectedReviewId = null;
      },
      error: err => {
        console.error('Error loading reviews:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not load reviews for this business.'
        });
      }
    });
  }

  onSubmit(): void {
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Required',
        text: 'Please log in to add a review.'
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }

    // Validate form
    if (this.reviewForm.invalid) {
      const errors = [];
      const ratingControl = this.reviewForm.get('rating');
      const textControl = this.reviewForm.get('text');
      
      if (ratingControl?.errors) {
        errors.push('Rating must be between 1 and 5');
      }
      if (textControl?.errors) {
        if (textControl.errors['required']) {
          errors.push('Review text is required');
        } else if (textControl.errors['minlength']) {
          errors.push('Review text must be at least 5 characters');
        } else if (textControl.errors['maxlength']) {
          errors.push('Review text must not exceed 500 characters');
        }
      }
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: errors.join('\n')
      });
      return;
    }

    this.loading = true;

    const payload = {
      rating: this.reviewForm.value.rating,
      text: this.reviewForm.value.text,
      userId: this.userId,
      businessId: this.businessId
    };

    console.log('Submitting review payload:', payload);

    if (this.isEdit && this.selectedReviewId !== null) {
      this.reviewService.updateReview(this.selectedReviewId, payload).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Updated',
            text: 'Your review has been updated.'
          });
          this.resetFormAndReload();
        },
        error: err => {
          this.loading = false;
          console.error('Update review error:', err);
          if (err.status === 401) {
            Swal.fire({
              icon: 'error',
              title: 'Session Expired',
              text: 'Your session has expired. Please log in again.'
            }).then(() => {
              this.router.navigate(['/login']);
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err.message || 'Failed to update your review. Please try again.'
            });
          }
        }
      });
    } else {
      this.reviewService.addReview(payload).subscribe({
        next: (response) => {
          this.loading = false;
          // Clear the form and reset its state
          this.reviewForm.reset();
          this.reviewForm.patchValue({
            rating: 5,
            text: ''
          });
          // Reset form validation state
          Object.keys(this.reviewForm.controls).forEach(key => {
            const control = this.reviewForm.get(key);
            control?.setErrors(null);
            control?.markAsPristine();
            control?.markAsUntouched();
          });
          
          Swal.fire({
            icon: 'success',
            title: 'Added',
            text: 'Your review has been added. You can add another review if you wish!'
          });
          // Reload reviews
          this.loadAllReviews();
        },
        error: err => {
          this.loading = false;
          console.error('Add review error:', err);
          if (err.status === 401) {
            Swal.fire({
              icon: 'error',
              title: 'Session Expired',
              text: 'Your session has expired. Please log in again.'
            }).then(() => {
              this.router.navigate(['/login']);
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err.message || 'Failed to add your review. Please try again.'
            });
          }
        }
      });
    }
  }

  editReview(review: IReview): void {
    if (!review.reviewId) {
      console.error('Cannot edit review: reviewId is undefined');
      return;
    }
    this.isEdit = true;
    this.selectedReviewId = review.reviewId;
    this.reviewForm.patchValue({
      rating: review.rating,
      text: review.text
    });
    // Scroll to the form
    document.querySelector('.card')?.scrollIntoView({ behavior: 'smooth' });
  }

  deleteReview(reviewId?: number): void {
    // If no reviewId is provided, try to use selectedReviewId
    const idToDelete = reviewId ?? this.selectedReviewId;
    
    if (!idToDelete) {
      console.error('Cannot delete review: No valid review ID provided');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Unable to delete review. Please try again.'
      });
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete your review permanently.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then(result => {
      if (result.isConfirmed) {
        this.loading = true;
        this.reviewService.deleteReview(idToDelete).subscribe({
          next: () => {
            this.loading = false;
            Swal.fire('Deleted!', 'Your review has been deleted.', 'success');
            this.resetFormAndReload();
          },
          error: err => {
            this.loading = false;
            console.error('Delete review error:', err);
            if (err.status === 401) {
              Swal.fire({
                icon: 'error',
                title: 'Session Expired',
                text: 'Your session has expired. Please log in again.'
              }).then(() => {
                this.router.navigate(['/login']);
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Could not delete your review. Please try again.'
              });
            }
          }
        });
      }
    });
  }

  private resetFormAndReload(): void {
    // Reset form to initial state
    this.reviewForm.reset({
      rating: 5,
      text: ''
    });
    this.isEdit = false;
    this.selectedReviewId = null;
    // Reload reviews to get the latest data
    this.loadAllReviews();
    // Scroll to top of the form
    document.querySelector('.card')?.scrollIntoView({ behavior: 'smooth' });
  }
}
