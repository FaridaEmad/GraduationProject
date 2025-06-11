import { Component, inject } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { BusinessService } from '../../core/services/business.service';
import { CategoryService } from '../../core/services/category.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { IBusiness } from '../../core/interfaces/ibusiness';
import { ICategory } from '../../core/interfaces/icategory';
import { IUser } from '../../core/interfaces/iuser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIf, NgChartsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private userService = inject(UserService);
  private businessService = inject(BusinessService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  usersCount = 0;
  businessCount = 0;
  categoriesCount = 0;

  latestUsers: IUser[] = [];
  latestBusiness: IBusiness[] = [];
  latestCategories: ICategory[] = [];

  // For view all functionality
  allUsers: IUser[] = [];
  allBusinesses: IBusiness[] = [];
  allCategories: ICategory[] = [];

  selectedSection: 'users' | 'business' | 'categories' = 'business';
  isLoading = true;
  showAll = false;

  // Charts
  barChartType: ChartType = 'bar';
  
  barChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Businesses per Category' }]
  };

  userChartData: ChartConfiguration['data'] = {
    labels: ['Admin', 'Client'],
    datasets: [{ data: [0, 0], label: 'User Types' }]
  };

  categoryChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Categories' }]
  };

  // Chart Options
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 12
          }
        }
      }
    }
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    
    // 🟣 Load Users
    this.userService.getallUsers().subscribe(users => {
      this.usersCount = users.length;
      this.allUsers = users;
      this.latestUsers = users.slice(-5).reverse();

      const adminCount = users.filter((u: any) => u.isAdmin).length;
      const clientCount = users.length - adminCount;

      this.userChartData = {
        labels: ['Admin', 'Client'],
        datasets: [{
          data: [adminCount, clientCount],
          label: 'User Types',
          backgroundColor: ['#1c5694', '#17a2b8'],
          borderColor: ['#1c5694', '#17a2b8'],
          borderWidth: 1
        }]
      };
    });

    // 🟢 Load Categories + Businesses
    this.categoryService.getallcategories().subscribe((cats: ICategory[]) => {
      this.categoriesCount = cats.length;
      this.allCategories = cats;
      this.latestCategories = cats.slice(-5).reverse();

      this.businessService.getAllBusiness().subscribe((businesses: IBusiness[]) => {
        this.allBusinesses = businesses;
        const businessCountsPerCategory = cats.map(cat =>
          businesses.filter(b => b.categoryId === cat.categoryId).length
        );

        this.categoryChartData = {
          labels: cats.map(c => c.name),
          datasets: [{
            data: businessCountsPerCategory,
            label: 'Businesses per Category',
            backgroundColor: '#ffc107',
            borderColor: '#ffc107',
            borderWidth: 1
          }]
        };
      });
    });

    // 🔵 Load Businesses separately for display + bar chart by City
    this.businessService.getAllBusiness().subscribe((businesses: IBusiness[]) => {
      this.businessCount = businesses.length;
      this.latestBusiness = businesses.slice(-5).reverse();

      const cityMap: { [city: string]: number } = {};
      businesses.forEach(b => {
        cityMap[b.city] = (cityMap[b.city] || 0) + 1;
      });

      this.barChartData = {
        labels: Object.keys(cityMap),
        datasets: [{
          data: Object.values(cityMap),
          label: 'Businesses per City',
          backgroundColor: '#a7287b',
          borderColor: '#a7287b',
          borderWidth: 1
        }]
      };
    });

    setTimeout(() => (this.isLoading = false), 1000);
  }

  viewAll() {
    this.showAll = !this.showAll;
  }

  refreshData() {
    this.loadData();
  }
}