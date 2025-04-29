// import { Component, inject, OnInit, OnDestroy } from '@angular/core';
// import { CategoryService } from '../../core/services/category.service';
// import { BusinessService } from '../../core/services/business.service';
// import { ICategory } from '../../core/interfaces/icategory';
// import { IBusiness } from '../../core/interfaces/ibusiness';
// import { Subscription } from 'rxjs';
// import { NgFor, NgIf } from '@angular/common';

// @Component({
//   selector: 'app-categories',
//   imports: [NgFor,NgIf],
//   templateUrl: './categories.component.html',
//   styleUrls: ['./categories.component.scss']
// })
// export class CategoriesComponent implements OnInit, OnDestroy {
//   private readonly __CategoryService = inject(CategoryService);
//   private readonly __BusinessService = inject(BusinessService);

//   categorylist: ICategory[] = [];
//   selectedCategoryBusiness: IBusiness[] = []; // لتخزين البيزنسات الخاصة بالكاتيجوري
//   getallcategories!: Subscription;
//   getBusinessByCategory!: Subscription;

//   ngOnInit(): void {
//     this.getallcategories = this.__CategoryService.getallcategories().subscribe({
//       next: (res) => {
//         console.log(res);
//         this.categorylist = res; // تخزين الكاتيجوريات في المتغير
//       },
//       error: (err) => {
//         console.log(err);
//       }
//     });
//   }

//     onCategoryClick(category: ICategory): void {
//     if (!category || !category.id) {
//       console.error("Selected category is undefined or invalid");
//       return;
//     }

//     console.log("Selected category:", category);
    
//     // Get businesses related to the selected category
//     this.getBusinessByCategory = this.__BusinessService.getBusinessByCategory(category.id).subscribe({
//       next: (res) => {
//         console.log("Businesses in selected category:", res);
//         this.selectedCategoryBusiness = res;
//       },
//       error: (err) => {
//         console.log("Error loading businesses:", err);
//       }
//     });
//   }

  
//   // دالة trackById
//   trackById(index: number, category: ICategory): number {
//     return category.id; // نعيد id الكاتيجوري لتتبع العناصر بشكل صحيح
//   }

//   ngOnDestroy(): void {
//     this.getallcategories?.unsubscribe();
//     this.getBusinessByCategory?.unsubscribe();
//   }
// }