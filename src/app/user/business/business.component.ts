import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

import { TermtxtPipe } from '../../pipes/termtxt.pipe';
import { BusinessService } from '../../core/services/business.service';
import { CategoryService } from '../../core/services/category.service';

import { IBusiness } from '../../core/interfaces/ibusiness';
import { ICategory } from '../../core/interfaces/icategory';
import { IReview } from '../../core/interfaces/ireview';

@Component({
  selector: 'app-business',
  standalone: true,
  imports: [RouterLink, FormsModule, TermtxtPipe, NgxPaginationModule, NgFor, NgIf],
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.scss']
})
export class BusinessComponent implements OnInit, OnDestroy {
  private readonly __BusinessService = inject(BusinessService);
  private readonly __CategoryService = inject(CategoryService);
  private readonly activatedRoute = inject(ActivatedRoute);

  wishlistUserDataId: string[] = [];
  wishlistSubscription!: Subscription;

  Businesslist: IBusiness[] = [];
  allBusiness: IBusiness[] = [];

  categories: ICategory[] = [];
  allcategories: ICategory[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 15;
  searchText: string = '';

  getallbusiness: Subscription | undefined;
  getallcategories: Subscription | undefined;
  filterSubscription: Subscription | undefined;

  cities: string[] = [];
  areas: string[] = [];

  selectedCity: string = '';
  selectedArea: string = '';
  selectedCategory: number | null = null;
  noDataMessage: string = '';

  reviewsByBusiness: { [businessId: number]: IReview[] } = {};
  showReviewForm: { [businessId: number]: boolean } = {};
  newReviewText: string = '';
  newReviewRating: number = 0;

  loadCategories(): void {
    this.getallcategories = this.__CategoryService.getallcategories().subscribe(
      (response: ICategory[]) => {
        this.categories = response;
        this.allcategories = response;
      },
      (error) => {
        console.error('Error loading categories:', error);
      }
    );
  }

  ngOnInit(): void {
    if (this.isUserLoggedIn()) {
      console.log('User is logged in');
      this.saveUserData();
    } else {
      console.log('User is not logged in');
    }

     this.__BusinessService.getallbusiness().subscribe(
    (data) => {
      this.Businesslist = data;
    },
    (error) => {
      console.error('Error fetching businesses:', error);
    }
  );
    this.loadCategories();

    this.activatedRoute.queryParams.subscribe(params => {
      const categoryIdParam = params['categoryId'];
      if (categoryIdParam) {
        const categoryId = +categoryIdParam;
        if (!isNaN(categoryId)) {
          this.selectedCategory = categoryId;
          this.applyFilters();
        } else {
          this.getAllBusiness();
        }
      } else {
        this.getAllBusiness();
      }
    });
  }

  isUserLoggedIn(): boolean {
    const token = localStorage.getItem('userToken');
    if (!token) {
      return false;
    }

    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp > currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  }

  saveUserData(): void {
    const token = localStorage.getItem('userToken');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        localStorage.setItem('userData', JSON.stringify(decodedToken));
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }

  getAllBusiness(): void {
    this.getallbusiness = this.__BusinessService.getallbusiness().subscribe({
      next: (res) => {
        if (res) {
          this.allBusiness = res;
          this.Businesslist = res;
          this.extractFilterData();
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
    if (!this.Businesslist || this.Businesslist.length === 0) return;

    this.cities = [...new Set(this.Businesslist.map(b => b.city).filter(city => city))];
    this.areas = [...new Set(this.Businesslist.map(b => b.area).filter(area => area))];
  }

  applyFilters(): void {
    const category = this.selectedCategory;
    const city = this.selectedCity.trim();
    const area = this.selectedArea.trim();

    const hasCategory = category !== null && category !== undefined && !isNaN(+category);
    const hasCity = city && city !== 'undefined' && city !== '';
    const hasArea = area && area !== 'undefined' && area !== '';

    if (hasCategory && hasCity) {
      this.filterSubscription = this.__BusinessService.getBusinessByCategoryAndCity(category!, city!).subscribe(res => {
        this.handleFilterResponse(res);
      });
    } else if (hasCategory && hasArea) {
      this.filterSubscription = this.__BusinessService.getBusinessByCategoryAndArea(category!, area!).subscribe(res => {
        this.handleFilterResponse(res);
      });
    } else if (hasCategory) {
      this.filterSubscription = this.__BusinessService.getBusinessByCategory(category!).subscribe(res => {
        this.handleFilterResponse(res);
      });
    } else if (hasCity) {
      this.filterSubscription = this.__BusinessService.getBusinessByCity(city!).subscribe(res => {
        this.handleFilterResponse(res);
      });
    } else if (hasArea) {
      this.filterSubscription = this.__BusinessService.getBusinessByArea(area!).subscribe(res => {
        this.handleFilterResponse(res);
      });
    } else {
      this.getAllBusiness();
    }
  }

  handleFilterResponse(res: IBusiness[]): void {
    if (res.length === 0) {
      this.Businesslist = [];
      this.noDataMessage = 'لا توجد أعمال تتطابق مع هذه الفلاتر';
    } else {
      this.Businesslist = res;
      this.noDataMessage = '';
    }
  }

  filterBusinessByCategory(categoryId: number): void {
    if (categoryId !== null) {
      this.Businesslist = this.allBusiness.filter(business => business.categoryId === categoryId);
    } else {
      this.Businesslist = this.allBusiness;
    }
  }

  onSearchChange(): void {
    const trimmedText = this.searchText.trim();

    if (trimmedText === '') {
      this.getAllBusiness();
    } else {
      this.__BusinessService.searchItems(trimmedText).subscribe({
        next: (data) => this.Businesslist = data as IBusiness[],
        error: (err) => console.error('Error fetching search results:', err)
      });
    }
  }



  trackById(index: number, product: IBusiness): string {
    return product.id?.toString() ?? index.toString();
  }




  ngOnDestroy(): void {
    this.getallcategories?.unsubscribe();
    this.getallbusiness?.unsubscribe();
    this.filterSubscription?.unsubscribe();
    this.wishlistSubscription?.unsubscribe();
  }
}
