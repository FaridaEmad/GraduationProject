import { Component, inject } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { BusinessService } from '../../core/services/business.service';
import { CategoryService } from '../../core/services/category.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { IBusiness } from '../../core/interfaces/ibusiness';
import { ICategory } from '../../core/interfaces/icategory';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ NgIf, NgChartsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private userService = inject(UserService);
  private businessService = inject(BusinessService);
  private categoryService = inject(CategoryService);

  usersCount = 0;
  businessCount = 0;
  categoriesCount = 0;

  latestUsers: any[] = [];
  latestBusiness: IBusiness[] = [];
  latestCategories: ICategory[] = [];

  selectedSection: 'users' | 'business' | 'categories' = 'business';
  isLoading = true;

  // Charts
  barChartType: ChartType = 'bar';
  

  barChartData: ChartConfiguration['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [{ data: [10, 20, 30, 40], label: 'Businesses' }]
  };

  userChartData: ChartConfiguration['data'] = {
    labels: ['Admin', 'Client'],
    datasets: [{ data: [5, 15], label: 'User Types' }]
  };

  categoryChartData: ChartConfiguration['data'] = {
    labels: ['Food', 'Tech', 'Beauty'],
    datasets: [{ data: [7, 12, 5], label: 'Categories' }]
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.userService.getallUsers().subscribe(users => {
      this.usersCount = users.length;
      this.latestUsers = users.slice(-5).reverse();
    });

    this.businessService.getallbusiness().subscribe(businesses => {
      this.businessCount = businesses.length;
      this.latestBusiness = businesses.slice(-5).reverse();
    });

    this.categoryService.getallcategories().subscribe(cats => {
      this.categoriesCount = cats.length;
      this.latestCategories = cats.slice(-5).reverse();
    });

    setTimeout(() => (this.isLoading = false), 1000);
  }
}
