import { Component, HostListener, inject, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ICategory } from '../../core/interfaces/icategory';
import { Subscription, of, forkJoin } from 'rxjs';
import { CategoryService } from '../../core/services/category.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TermtxtPipe } from '../../pipes/termtxt.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgFor, NgIf } from '@angular/common';
import { BusinessService } from '../../core/services/business.service';
import { IBusiness } from '../../core/interfaces/ibusiness';
import { MachineService } from '../../core/services/machine.service';
import { CarouselModule, CarouselComponent } from 'ngx-owl-carousel-o';
import { register } from 'swiper/element/bundle';

import { catchError, timeout, tap, retry } from 'rxjs/operators';

// Register Swiper custom elements
register();

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, TermtxtPipe, FormsModule, NgxPaginationModule, NgFor, NgIf, CarouselModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private readonly __BusinessService = inject(BusinessService);
  private readonly __CategoryService = inject(CategoryService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly __machineService = inject(MachineService);

// @ViewChild('owlCar', { static: false }) owlCar!: CarouselComponent;
@ViewChild('owlCar', { static: false }) owlCar!: any;


  typedText = '';
  fullText = 'Discover Top Places Around You';
  currentIndex = 0;
  typingSpeed = 150;

  userId: number | null = null;
  wishlistUserDataId: string[] = [];
  wishlistSubscription!: Subscription;

  recommendedBusinesses: IBusiness[] = [];
  Businesslist: IBusiness[] = [];
  allBusiness: IBusiness[] = [];

  categories: ICategory[] = [];
  allcategories: ICategory[] = [];
  categorylist: ICategory[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 15;
  searchText: string = '';

  getallbusiness!: Subscription;
  getallcategories!: Subscription;
  filterSubscription!: Subscription;

  cities: string[] = [];
  areas: string[] = [];

  selectedCity: string = '';
  selectedArea: string = '';
  selectedCategory: number | null = null;
  noDataMessage: string = '';

  carouselOptions = {
    loop: true,
    margin: 10,
    nav: true,
    dots: true,
    autoplay: true,
    autoplayTimeout: 100,
    autoplayHoverPause: true,
    navText: ['<', '>'],
    responsive: {
      0: { items: 1 },
      600: { items: 2 },
      900: { items: 3 },
      1200: { items: 3 }
    }
  };

  isLoadingRecommendations: boolean = false;
  recommendationError: string | null = null;

  ngOnInit(): void {
    this.extractUserIdFromToken();
    this.typeText();
    this.loadCategories();
    this.loadRecommendedBusinesses();

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

  typeText() {
    const interval = setInterval(() => {
      if (this.currentIndex < this.fullText.length) {
        this.typedText += this.fullText[this.currentIndex];
        this.currentIndex++;
      } else {
        this.currentIndex = 1;
        this.typedText = 'D';
      }
    }, this.typingSpeed);
  }

  loadCategories(): void {
    this.getallcategories = this.__CategoryService.getallcategories().subscribe({
      next: (res) => {
        this.allcategories = res;
        this.categories = res;
        this.categorylist = res;
      },
      error: (err) => console.error('Error fetching categories:', err)
    });
  }

  getAllBusiness(): void {
    this.getallbusiness = this.__BusinessService.getAllBusiness().subscribe({
      next: (res) => {
        if (res) {
          this.allBusiness = res;
          this.Businesslist = res;
          this.extractFilterData();
        } else {
          console.error('The returned data is invalid');
        }
      },
      error: (err) => console.error('Error fetching data:', err)
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
    this.Businesslist = categoryId !== null
      ? this.allBusiness.filter(b => b.categoryId === categoryId)
      : this.allBusiness;
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
    return product.businessId?.toString() ?? index.toString();
  }

  ngOnDestroy(): void {
    this.getallcategories?.unsubscribe();
    this.getallbusiness?.unsubscribe();
    this.filterSubscription?.unsubscribe();
    this.wishlistSubscription?.unsubscribe();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const section = document.getElementById('business-section');
    if (section) {
      const position = section.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      if (position < windowHeight - 100) {
        section.classList.add('visible');
      }
    }
  }

  extractUserIdFromToken(): void {
    const token = localStorage.getItem('userToken');
    if (token) {
      try {
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        // Check for both possible claims
        const userId = decodedPayload['userId'] || decodedPayload['nameid'];
        if (userId) {
          this.userId = +userId;
          console.log('Successfully extracted userId:', this.userId);
        } else {
          console.error('No userId found in token payload');
          this.userId = null;
        }
      } catch (error) {
        console.error('Error parsing token:', error);
        this.userId = null;
      }
    } else {
      console.log('No token found in localStorage');
      this.userId = null;
    }
  }

  loadRecommendedBusinesses(): void {
    console.log('Starting loadRecommendedBusinesses...');
    this.isLoadingRecommendations = true;
    this.recommendationError = null;
    
    const userId = this.userId;
    console.log('Current userId:', userId);
    
    if (!userId) {
      console.log('No userId available, skipping recommendations');
      this.recommendedBusinesses = [];
      this.isLoadingRecommendations = false;
      return;
    }

    // First get recommendations
    console.log('Calling getUserRecommendations API...');
    this.__machineService.getUserRecommendations(userId).subscribe({
      next: (recommendations: { businessId: number }[]) => {
        console.log('Received recommendations:', recommendations);
        
        if (!recommendations || recommendations.length === 0) {
          console.log('No recommendations received from API');
          this.recommendedBusinesses = [];
          this.isLoadingRecommendations = false;
          return;
        }

        // Process each business one by one to avoid overwhelming the server
        let processedCount = 0;
        const validBusinesses: IBusiness[] = [];

        console.log('Starting to fetch individual businesses...');
        recommendations.forEach(rec => {
          console.log(`Fetching business with ID: ${rec.businessId}`);
          this.__BusinessService.getOneBusiness(rec.businessId).subscribe({
            next: (businessData: any) => {
              console.log(`Received business data for ID ${rec.businessId}:`, businessData);
              // The API returns an array with one business object
              const business = Array.isArray(businessData) ? businessData[0] : businessData;
              
              // Log the full business object structure
              console.log(`Business ${rec.businessId} full data:`, JSON.stringify(business, null, 2));
              
              // Check if business has images in any of the possible formats
              const hasImages = business && (
                (business.images && business.images.length > 0) ||
                (business.image && business.image.length > 0) ||
                (business.imageUrl && business.imageUrl.length > 0)
              );

              if (hasImages) {
                console.log(`Adding valid business ${rec.businessId} to recommendations`);
                validBusinesses.push(business);
                this.recommendedBusinesses = [...validBusinesses];
                console.log('Current recommendedBusinesses:', this.recommendedBusinesses);
              } else {
                console.log(`Business ${rec.businessId} skipped - no valid images. Business data:`, business);
              }
              processedCount++;
              
              // When all businesses are processed, initialize swiper
              if (processedCount === recommendations.length) {
                console.log('All businesses processed. Final count:', this.recommendedBusinesses.length);
                this.isLoadingRecommendations = false;
                this.initializeSwiper();
              }
            },
            error: (err) => {
              console.error(`Error fetching business with id: ${rec.businessId}`, err);
              processedCount++;
              
              // Still initialize swiper even if some businesses fail
              if (processedCount === recommendations.length) {
                console.log('All businesses processed (with errors). Final count:', this.recommendedBusinesses.length);
                this.isLoadingRecommendations = false;
                this.initializeSwiper();
              }
            }
          });
        });
      },
      error: err => {
        console.error('Error loading recommendations:', err);
        this.recommendedBusinesses = [];
        this.recommendationError = 'Failed to load recommendations. Please try again later.';
        this.isLoadingRecommendations = false;
      }
    });
  }

  private initializeSwiper(): void {
    console.log('Initializing swiper with businesses:', this.recommendedBusinesses.length);
    setTimeout(() => {
      const swiperEl = document.querySelector('swiper-container');
      if (swiperEl) {
        Object.assign(swiperEl, {
          slidesPerView: 1,
          spaceBetween: 30,
          loop: true,
          speed: 1000,
          autoplay: {
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
            waitForTransition: true
          },
          breakpoints: {
            640: { 
              slidesPerView: 2,
              spaceBetween: 20
            },
            768: { 
              slidesPerView: 2,
              spaceBetween: 30
            },
            1024: { 
              slidesPerView: 3,
              spaceBetween: 30
            }
          }
        });
        
        // Initialize the swiper
        swiperEl.initialize();
        
        // Force autoplay to start
        const swiper = swiperEl.swiper;
        if (swiper) {
          swiper.autoplay.start();
        }
        
        console.log('Swiper initialized with autoplay');
      } else {
        console.log('Swiper element not found');
      }
    }, 100);
  }

  scrollToBusiness() {
    const element = document.getElementById('bu');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
