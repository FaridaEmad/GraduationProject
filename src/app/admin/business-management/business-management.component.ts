import { CategoryService } from './../../core/services/category.service';
import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { IBusiness, IBusinessCreate, IBusinessUpdate } from '../../core/interfaces/ibusiness';
import { ICategory } from '../../core/interfaces/icategory';
import { IUser } from '../../core/interfaces/iuser';
import { BusinessService } from '../../core/services/business.service';
import { UserService } from '../../core/services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-business-management',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './business-management.component.html',
  styleUrls: ['./business-management.component.scss']
})
export class BusinessManagementComponent implements OnInit, OnDestroy {
  businesses: IBusiness[] = [];
  allBusiness: IBusiness[] = [];
  filteredBusinesses: IBusiness[] = [];

  categories: ICategory[] = [];
  allcategories: ICategory[] = [];
  adminUsers: IUser[] = [];

  cities: string[] = [];
  areas: string[] = [];

  searchText = '';
  selectedCategoryId: number | null = null;
  selectedCity: string = '';
  selectedArea: string = '';
  noDataMessage: string = '';

  currentPage = 1;
  itemsPerPage = 30;

  form!: FormGroup;
  isEditMode = false;
  selectedBusinessId: number | null = null;

  getallbusiness!: Subscription;
  getallcategories!: Subscription;
  getallusers!: Subscription;
  filterSubscription!: Subscription;

  @ViewChild('businessModal') businessModal!: ElementRef<HTMLDialogElement>;

  constructor(
    private businessService: BusinessService,
    private categoryService: CategoryService,
    private userService: UserService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute
  ) {}

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
    this.getallcategories?.unsubscribe();
    this.getallbusiness?.unsubscribe();
    this.getallusers?.unsubscribe();
    this.filterSubscription?.unsubscribe();
  }

  initForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      area: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      logo: ['', [Validators.required, Validators.pattern('https?://.+\.(jpg|jpeg|png|gif|webp|svg)$')]],
      categoryId: [null, [Validators.required]],
      userId: [null, [Validators.required]],
      imageUrls: ['', [Validators.pattern('^(https?://.+\.(jpg|jpeg|png|gif|webp|svg)$)(,\s*https?://.+\.(jpg|jpeg|png|gif|webp|svg)$)*$')]]
    });
  }

  // Add getter methods for form controls
  get name() { return this.form.get('name'); }
  get city() { return this.form.get('city'); }
  get area() { return this.form.get('area'); }
  get logo() { return this.form.get('logo'); }
  get categoryId() { return this.form.get('categoryId'); }
  get userId() { return this.form.get('userId'); }
  get imageUrls() { return this.form.get('imageUrls'); }

  loadCategories(): void {
    this.getallcategories = this.categoryService.getallcategories().subscribe({
      next: (res) => {
        this.allcategories = res;
        this.categories = res;
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      }
    });
  }

  loadAdminUsers(): void {
    this.getallusers = this.userService.getallUsers().subscribe({
      next: (res) => {
        this.adminUsers = res.filter(user => user.isAdmin);
      },
      error: (err) => {
        console.error('Error fetching admin users:', err);
      }
    });
  }

  getAllBusiness(): void {
    this.getallbusiness = this.businessService.getallbusiness().subscribe({
      next: (res) => {
        if (res) {
          this.allBusiness = res;
          this.businesses = res;
          this.filteredBusinesses = res;
          this.extractFilterData();
          this.applyFilters();
        } else {
          console.error('The returned data is invalid');
        }
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      }
    });
  }

  extractFilterData(): void {
    if (!this.allBusiness || this.allBusiness.length === 0) return;

    this.cities = [...new Set(this.allBusiness.map(b => b.city).filter(Boolean))];
    this.areas = [...new Set(this.allBusiness.map(b => b.area).filter(Boolean))];
  }

  applyFilters(): void {
    let filtered = this.allBusiness;

    if (this.selectedCategoryId != null) {
      filtered = filtered.filter(b => b.categoryId === this.selectedCategoryId);
      console.log('selectedCategoryId type:', typeof this.selectedCategoryId, this.selectedCategoryId);

    }


    if (this.selectedCity) {
      filtered = filtered.filter(b => b.city === this.selectedCity);
    }

    if (this.selectedArea) {
      filtered = filtered.filter(b => b.area === this.selectedArea);
    }

    if (this.searchText.trim()) {
      const text = this.searchText.trim().toLowerCase();
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(text)
      );
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

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedBusinessId = null;
    this.form.reset();
    this.businessModal?.nativeElement.showModal();
  }

  openEditModal(business: IBusiness): void {
    this.isEditMode = true;
    this.selectedBusinessId = business.id;

    this.form.patchValue({
      name: business.name,
      city: business.city,
      area: business.area,
      logo: business.logo,
      categoryId: business.categoryId,
      userId: business.userId,
      imageUrls: business.imageUrls?.join(',') || ''
    });

    this.businessModal?.nativeElement.showModal();
  }

  closeModal(): void {
    if (this.businessModal?.nativeElement.open) {
      this.businessModal.nativeElement.close();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    if (this.isEditMode && this.selectedBusinessId !== null) {
      const updateData: IBusinessUpdate = {
        name: formValue.name,
        city: formValue.city,
        area: formValue.area,
        logo: formValue.logo,
        categoryId: formValue.categoryId,
        userId: formValue.userId
      };

      this.businessService.updateBusiness(this.selectedBusinessId, updateData).subscribe(
        () => {
          Swal.fire('Updated!', 'Business updated successfully.', 'success');
          this.closeModal();
          this.refreshData();
        },
        (error) => {
          console.error('Error updating business:', error);
          Swal.fire('Error', 'There was an error updating the business.', 'error');
        }
      );
    } else {
      const newBusiness: IBusinessCreate = {
        name: formValue.name,
        city: formValue.city,
        area: formValue.area,
        logo: formValue.logo,
        categoryId: formValue.categoryId,
        userId: formValue.userId,
        imageUrls: formValue.imageUrls
      };

      this.businessService.addBusiness(newBusiness).subscribe(() => {
        Swal.fire('Added!', 'New business added successfully.', 'success');
        this.closeModal();
        this.refreshData();
      });
    }
  }

  confirmDelete(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.businessService.deleteBusiness(id).subscribe(() => {
          Swal.fire('Deleted!', 'Business has been deleted.', 'success');
          this.refreshData();
        });
      }
    });
  }

  refreshData(): void {
    this.businessService.getallbusiness().subscribe(res => {
      this.allBusiness = res;
      this.businesses = res;
      this.filteredBusinesses = res;
      this.extractFilterData();
      this.applyFilters();
    });
  }

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
    return this.categories.find(cat => cat.categoryId === id)?.name || 'Unknown';
  }

  trackById(index: number, item: IBusiness): string {
    return item.id?.toString() ?? index.toString();
  }
}
