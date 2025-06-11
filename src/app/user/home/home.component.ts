import { Component, HostListener, inject, OnInit } from '@angular/core';
import { ICategory } from '../../core/interfaces/icategory';
import { Subscription } from 'rxjs';
import { CategoryService } from '../../core/services/category.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TermtxtPipe } from '../../pipes/termtxt.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgFor, NgIf } from '@angular/common';
import { BusinessService } from '../../core/services/business.service';
import { IBusiness } from '../../core/interfaces/ibusiness';

@Component({
  selector: 'app-home',
  imports: [RouterLink, TermtxtPipe,FormsModule, NgxPaginationModule,NgFor,NgIf],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private readonly __BusinessService = inject(BusinessService);
  private readonly __CategoryService = inject(CategoryService);
  private readonly activatedRoute = inject(ActivatedRoute);
  typedText = '';  // دي هتكون الجملة اللى هنكتبها حرف حرف
  fullText = 'Discover Top Places Around You';  // الجملة الكاملة
  currentIndex = 0;  // هنا هنحدد أول حرف هنبدأ منه
  typingSpeed = 150  

  wishlistUserDataId: string[] = [];
  wishlistSubscription!: Subscription;

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

  ngOnInit(): void {
    
this.typeText();

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

  typeText() {
    // كل ما الوقت يمشي هنضيف حرف جديد للجملة
    const interval = setInterval(() => {
      if (this.currentIndex < this.fullText.length) {
        this.typedText += this.fullText[this.currentIndex];
        this.currentIndex++;
      } else {
        this.currentIndex = 1;  // إعادة البدء من الحرف الأول
        this.typedText = 'D'; // لما نوصل لآخر حرف نبطل الكتابة
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
      error: (err) => {
        console.error('Error fetching categories:', err);
      }
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

    // التأكد من أنه عندما يتم إزالة تصنيف أو مدينة أو منطقة, الفلاتر الأخرى تُعاد لحالتها الافتراضية
    if (hasCategory && hasCity) {
      this.filterSubscription = this.__BusinessService.getBusinessByCategoryAndCity(category!, city!).subscribe(res => {
        if (res.length === 0) {
          this.Businesslist = [];
          this.noDataMessage = 'لا توجد أعمال تتطابق مع هذه الفلاتر';
        } else {
          this.Businesslist = res;
          this.noDataMessage = '';
        }
      });
    } else if (hasCategory && hasArea) {
      this.filterSubscription = this.__BusinessService.getBusinessByCategoryAndArea(category!, area!).subscribe(res => {
        if (res.length === 0) {
          this.Businesslist = [];
          this.noDataMessage = 'لا توجد أعمال تتطابق مع هذه الفلاتر';
        } else {
          this.Businesslist = res;
          this.noDataMessage = '';
        }
      });
    } else if (hasCategory) {
      this.filterSubscription = this.__BusinessService.getBusinessByCategory(category!).subscribe(res => {
        if (res.length === 0) {
          this.Businesslist = [];
          this.noDataMessage = 'لا توجد أعمال تتطابق مع هذه الفلاتر';
        } else {
          this.Businesslist = res;
          this.noDataMessage = '';
        }
      });
    } else if (hasCity) {
      this.filterSubscription = this.__BusinessService.getBusinessByCity(city!).subscribe(res => {
        if (res.length === 0) {
          this.Businesslist = [];
          this.noDataMessage = 'لا توجد أعمال تتطابق مع هذه الفلاتر';
        } else {
          this.Businesslist = res;
          this.noDataMessage = '';
        }
      });
    } else if (hasArea) {
      this.filterSubscription = this.__BusinessService.getBusinessByArea(area!).subscribe(res => {
        if (res.length === 0) {
          this.Businesslist = [];
          this.noDataMessage = 'لا توجد أعمال تتطابق مع هذه الفلاتر';
        } else {
          this.Businesslist = res;
          this.noDataMessage = '';
        }
      });
    } else {
      this.getAllBusiness();
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
scrollToBusiness() {
  const section = document.getElementById('business-section');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}


}
