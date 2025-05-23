import { Component, inject, OnInit } from '@angular/core';
import { ICategory } from '../../core/interfaces/icategory';
import { Subscription } from 'rxjs';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private readonly __CategoryService = inject(CategoryService);
  categorylist: ICategory[] = [];
  // subcategory!:Icategory[];
  getallcategories!: Subscription;
  ngOnInit(): void {
    // Assign the subscription to getallproducts
    
    this.getallcategories = this.__CategoryService.getallcategories().subscribe({
      next: (res) => {
        console.log(res);
        this.categorylist = res;  
      },
      error: (err) => {
        console.log(err);
      }
    });
    // this.getallcategories = this.__CategoryService.getallcategories().subscribe({
    //   next: (res) => {
    //     console.log(res.data);
    //     this.categorylist = res.data;  
    //   },
    //   error: (err) => {
    //     console.log(err);
    //   }
    // });
  }
  // getAllSubCategories(catgeoryId:string) {
  //   this.__CategoryService.getaonecategory(catgeoryId).subscribe({
  //     next: (res) => {
  //       this.subcategory = res.data;
  //       // console.log(this.categoryList);
  //     },
  //     error: (err) => {
  //       console.log(err);      },
  //   });
  // }
  ngOnDestroy(): void {
    
    this.getallcategories?.unsubscribe();
    
  }
}
