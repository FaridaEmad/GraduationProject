import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { CurrencyPipe } from '@angular/common';
import { SearchPipe } from '../../pipes/search.pipe';
import { TermtxtPipe } from '../../pipes/termtxt.pipe';
import { Subscription } from 'rxjs';

import { BusinessService } from '../../core/services/business.service';
import { CategoryService } from '../../core/services/category.service';
import { IBusiness } from '../../interfaces/ibusiness';
import { ICategory } from '../../interfaces/icategory';

@Component({
  selector: 'app-business',
  standalone: true,
  imports: [RouterLink, FormsModule, SearchPipe, CurrencyPipe, TermtxtPipe, NgxPaginationModule],
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.scss']
})
export class BusinessComponent implements OnInit, OnDestroy {
  private readonly __BusinessService = inject(BusinessService);
  private readonly __CategoryService = inject(CategoryService);

  wishlistUserDataId: string[] = [];
  wishlistSubscription!: Subscription;
  Businesslist: IBusiness[] = [];
  categories: ICategory[] = [];
  allcategories: ICategory[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 15;
  searchText: string = '';
  getallbusiness!: Subscription;
  getallcategories!: Subscription;

  cities: string[] = [];
  areas: string[] = [];

  selectedCity: string = '';
  selectedArea: string = '';
  selectedCategory: number | '' = '';


  ngOnInit(): void {
    this.getallcategories = this.__CategoryService.getallcategories().subscribe({
      next: (res) => {
        this.allcategories = res;
        console.log("Categories loaded:", this.allcategories);
        this.extractFilterData();
      },
      error: (err) => {
        console.log(err);
      }
    });
    this.getAllBusiness();
  }

  getAllBusiness(): void {
    this.getallbusiness = this.__BusinessService.getallbusiness().subscribe({
      next: (res) => {
        if (res) {
          this.Businesslist = res;
          this.extractFilterData();
        } else {
          console.error('البيانات التي تم إرجاعها غير صحيحة');
        }
      },
      error: (err) => {
        console.log('حدث خطأ أثناء جلب البيانات:', err);
      }
    });
  }

  extractFilterData(): void {
    if (!this.Businesslist || this.Businesslist.length === 0) {
      console.error('قائمة الأعمال فارغة');
      return;
    }

    const allCities = this.Businesslist.map(b => b.city);
    
    this.cities = [...new Set(allCities)];

    const allAreas = this.Businesslist.map(b => b.area);
    
    this.areas = [...new Set(allAreas)];

    this.categories = this.allcategories;
    
    
  }

  // getCategoryName(categoryId: string): string {
  //   const category = this.categories.find(cat => cat.id === categoryId);
  //   return category ? category.name : 'غير معروف';
  // }

  // onCityChange(): void {
  //   const filtered = this.Businesslist.filter(b => b.city === this.selectedCity);
  //   const allAreas = filtered.map(b => b.area);
  //   this.areas = [...new Set(allAreas)];
  // }

  applyFilters(): void {
    const category = this.selectedCategory;
    const city = this.selectedCity?.trim();
    const area = this.selectedArea?.trim();
  
    const hasCategory = typeof category === 'number';
    const hasCity = city && city !== 'undefined' && city !== '';
    const hasArea = area && area !== 'undefined' && area !== '';
  
    console.log('Selected Category:', this.selectedCategory, typeof this.selectedCategory);

    console.log('City:', city);
    console.log('Area:', area);
  
    if (hasCategory) {
      this.__BusinessService.getBusinessByCategory(category).subscribe(res => {
        console.log('Filtered by category:', res);
        this.Businesslist = res;
      });
    } else if (hasCity) {
      this.__BusinessService.getBusinessByCity(city!).subscribe(res => {
        console.log('Filtered by city:', res);
        this.Businesslist = res;
      });
    } else if (hasArea) {
      this.__BusinessService.getBusinessByArea(area!).subscribe(res => {
        console.log('Filtered by area:', res);
        this.Businesslist = res;
      });
    } else {
      this.getAllBusiness();
    }
  }
  
  
  
  
  
  
  

  
  

  trackById(index: number, product: IBusiness): string {
    return product.id ? product.id.toString() : index.toString();
  }
 ngOnChanges(): void {
  //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
  //Add '${implements OnChanges}' to the class.
  this.applyFilters();
 }
  ngOnDestroy(): void {
    this.getallcategories?.unsubscribe();
    this.getallbusiness?.unsubscribe();
    this.wishlistSubscription?.unsubscribe();
  }
}