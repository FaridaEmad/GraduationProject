import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { BusinessService } from '../../core/services/business.service';
import { CategoryService } from '../../core/services/category.service';
import { UserService } from '../../core/services/user.service';

import { IBusiness, IBusinessCreate, IBusinessUpdate } from '../../core/interfaces/ibusiness';
import { ICategory } from '../../core/interfaces/icategory';
import { IUser } from '../../core/interfaces/iuser';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-business-management',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './business-management.component.html',
  styleUrls: ['./business-management.component.scss']
})
export class BusinessManagementComponent implements OnInit, OnDestroy {
  /* Data collections */
  businesses: IBusiness[] = [];
  allBusiness: IBusiness[] = [];
  filteredBusinesses: IBusiness[] = [];

  categories: ICategory[] = [];
  adminUsers: IUser[] = [];

  /* Filters */
  cities: string[] = [];
  areas: string[] = [];

  searchText = '';
  selectedCategoryId: number | null = null;
  selectedCity = '';
  selectedArea = '';
  noDataMessage = '';

  /* Pagination */
  currentPage = 1;
  itemsPerPage = 30;

  /* Form */
  form!: FormGroup;
  isEditMode = false;
  selectedBusinessId: number | null = null;

  /* Subscriptions */
  private getallbusinessSub!: Subscription;
  private getallcategoriesSub!: Subscription;
  private getallusersSub!: Subscription;

  @ViewChild('businessModal')
  businessModal!: ElementRef<HTMLDialogElement>;

  constructor(
    private businessService: BusinessService,
    private categoryService: CategoryService,
    private userService: UserService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute
  ) {}

  /* -------------------- Life-cycle -------------------- */
  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.loadAdminUsers();

    this.activatedRoute.queryParams.subscribe(params => {
      const categoryIdParam = params['categoryId'];
      if (categoryIdParam && !isNaN(+categoryIdParam)) {
        this.selectedCategoryId = +categoryIdParam;
      }
      this.getAllBusiness();
    });
  }

  ngOnDestroy(): void {
    this.getallbusinessSub?.unsubscribe();
    this.getallcategoriesSub?.unsubscribe();
    this.getallusersSub?.unsubscribe();
  }

  /* -------------------- Form Init -------------------- */
  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      area: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      logo: ['', [Validators.required, Validators.pattern('https?://.+\\.(jpg|jpeg|png|gif|webp|svg)$')]],
      categoryId: [null, [Validators.required]],
      userId: [null, [Validators.required]],
      imageUrls: ['', [Validators.pattern('^(https?://.+\.(jpg|jpeg|png|gif|webp|svg)$)(,\s*https?://.+\.(jpg|jpeg|png|gif|webp|svg)$)*$')]]
    });

    // Subscribe to form value changes to update validation state
    this.form.valueChanges.subscribe(() => {
      if (this.isEditMode) {
        // For edit mode, only validate required fields
        const controls = this.form.controls;
        Object.keys(controls).forEach(key => {
          const control = controls[key];
          if (control.value === '' || control.value === null) {
            control.setErrors({ required: true });
          } else {
            control.setErrors(null);
          }
        });
      }
    });
  }

  /* Getters for template validation */
  get name() { return this.form.get('name'); }
  get city() { return this.form.get('city'); }
  get area() { return this.form.get('area'); }
  get logo() { return this.form.get('logo'); }
  get categoryId() { return this.form.get('categoryId'); }
  get userId() { return this.form.get('userId'); }
  get imageUrls() { return this.form.get('imageUrls'); }

  /* -------------------- Loaders -------------------- */
  private loadCategories(): void {
    this.getallcategoriesSub = this.categoryService.getallcategories().subscribe({
      next: res => (this.categories = res),
      error: err => console.error('Error fetching categories:', err)
    });
  }

  private loadAdminUsers(): void {
    this.getallusersSub = this.userService.getallUsers().subscribe({
      next: res => (this.adminUsers = res.filter(u => u.isAdmin)),
      error: err => console.error('Error fetching admin users:', err)
    });
  }

  private getAllBusiness(): void {
    this.getallbusinessSub = this.businessService.getAllBusiness().subscribe({
      next: res => {
        this.allBusiness = res;
        this.filteredBusinesses = res;
        this.extractFilterData();
        this.applyFilters();
      },
      error: err => console.error('Error fetching businesses:', err)
    });
  }

  /* -------------------- Filtering -------------------- */
  private extractFilterData(): void {
    this.cities = [...new Set(this.allBusiness.map(b => b.city).filter(Boolean))];
    this.areas = [...new Set(this.allBusiness.map(b => b.area).filter(Boolean))];
  }

  applyFilters(): void {
    let filtered = this.allBusiness;

    if (this.selectedCategoryId !== null) {
      filtered = filtered.filter(b => b.categoryId === this.selectedCategoryId);
    }

    if (this.selectedCity) {
      filtered = filtered.filter(b => b.city === this.selectedCity);
    }

    if (this.selectedArea) {
      filtered = filtered.filter(b => b.area === this.selectedArea);
    }

    if (this.searchText.trim()) {
      const text = this.searchText.trim().toLowerCase();
      filtered = filtered.filter(b => b.name.toLowerCase().includes(text));
    }

    this.filteredBusinesses = filtered;
    this.noDataMessage = filtered.length === 0 ? 'No Businesses Found' : '';
    this.currentPage = 1;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  /* -------------------- Modal Control -------------------- */
  openAddModal(): void {
    this.isEditMode = false;
    this.selectedBusinessId = null;
    this.form.reset();
    this.businessModal.nativeElement.showModal();
  }

  openEditModal(business: IBusiness): void {
    this.isEditMode = true;
    this.selectedBusinessId = business.businessId;
    
    this.form.patchValue({
      name: business.name,
      city: business.city,
      area: business.area,
      logo: business.logo,
      categoryId: business.categoryId,
      userId: business.userId,
      imageUrls: business.images
    });

    this.businessModal.nativeElement.showModal();
  }

  closeModal(): void {
    if (this.businessModal.nativeElement.open) {
      this.businessModal.nativeElement.close();
    }
  }

  /* -------------------- Submit -------------------- */
   onSubmit(): void {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    // Ensure categoryId and userId are numbers
    const categoryId = Number(formValue.categoryId);
    const userId = Number(formValue.userId);

    if (this.isEditMode && this.selectedBusinessId !== null) {
      const updateData: IBusinessUpdate = {
        name: formValue.name,
        city: formValue.city,
        area: formValue.area,
        logo: formValue.logo,
        categoryId: categoryId,
        userId: userId
      } 

      this.businessService.updateBusiness(this.selectedBusinessId, updateData).subscribe({
        next: () => {
          Swal.fire('Updated!', 'Business updated successfully.', 'success');
          this.closeModal();
          this.refreshData();
        },
        error: err => {
          console.error('Error updating business:', err);
          Swal.fire('Error', 'There was an error updating the business.', 'error');
        }
      });
    } else {
      const newBusiness = {
        name: formValue.name,
        city: formValue.city,
        area: formValue.area,
        logo: formValue.logo,
        categoryId: categoryId,
        userId: userId,
        imageUrls: formValue.imageUrls || ''
      } as IBusinessCreate;

      this.businessService.addBusiness(newBusiness).subscribe({
        next: () => {
          Swal.fire('Added!', 'New business added successfully.', 'success');
          this.closeModal();
          this.refreshData();
        },
        error: err => {
          console.error('Error adding business:', err);
          Swal.fire('Error', 'There was an error adding the business.', 'error');
        }
      });
    }
  }

  /* -------------------- Delete -------------------- */
  confirmDelete(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.businessService.deleteBusiness(id).subscribe(() => {
          Swal.fire('Deleted!', 'Business has been deleted.', 'success');
          this.refreshData();
        });
      }
    });
  }

  /* -------------------- Helpers -------------------- */
  private refreshData(): void {
    this.businessService.getAllBusiness().subscribe((res: IBusiness[]) => {
      this.allBusiness = res;
      this.filteredBusinesses = res;
      this.extractFilterData();
      this.applyFilters();
    });
  }

  /* Pagination getters */
  get paginatedBusinesses(): IBusiness[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredBusinesses.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number[] {
    const total = Math.ceil(this.filteredBusinesses.length / this.itemsPerPage);
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  getCategoryName(id: number): string {
    return this.categories.find(c => c.categoryId === id)?.name || 'Unknown';
  }

  trackById(index: number, item: IBusiness): string {
    return item.businessId?.toString() ?? index.toString();
  }
}