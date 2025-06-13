import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { BusinessService } from '../../core/services/business.service';
import { CategoryService } from '../../core/services/category.service';
import { MachineService } from '../../core/services/machine.service';
import { CommonModule } from '@angular/common';
import { NgIf, NgFor } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { IBusiness } from '../../core/interfaces/ibusiness';
import { ICategory } from '../../core/interfaces/icategory';
import { IUser } from '../../core/interfaces/iuser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIf, NgFor, NgChartsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],  // صححت كلمة styleUrls
})
export class HomeComponent implements OnInit {
  usersCount = 0;
  businessCount = 0;
  categoriesCount = 0;

  latestUsers: IUser[] = [];
  latestBusiness: IBusiness[] = [];
  latestCategories: ICategory[] = [];

  allUsers: IUser[] = [];
  allBusinesses: IBusiness[] = [];
  allCategories: ICategory[] = [];

  selectedSection: 'users' | 'business' | 'categories' = 'business';
  isLoading = true;
  showAll = false;

  recommendedBusinesses: IBusiness[] = [];
  userId: number | null = null;

  barChartType: ChartType = 'bar';

  barChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Businesses per City' }]
  };

  userChartData: ChartConfiguration['data'] = {
    labels: ['Admin', 'Client'],
    datasets: [{ data: [0, 0], label: 'User Types' }]
  };

  categoryChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Businesses per Category' }]
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        displayColors: false
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 12 } } },
      y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' }, ticks: { font: { size: 12 } } }
    }
  };

  constructor(
    private userService: UserService,
    private businessService: BusinessService,
    private categoryService: CategoryService,
    private machineService: MachineService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.extractUserIdFromToken();
    this.loadData();
    if (this.userId) {
      this.loadUserRecommendations(this.userId);
    }
  }

  extractUserIdFromToken(): void {
    const token = localStorage.getItem('userToken');
    if (token) {
      try {
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        this.userId = +decodedPayload['nameid'];
      } catch (error) {
        console.error('Error decoding token:', error);
        this.userId = null;
      }
    }
  }

  loadUserRecommendations(userId: number): void {
    this.recommendedBusinesses = []; // تفريغ المصفوفة قبل التحميل
    this.machineService.getUserRecommendations(userId).subscribe({
      next: (recommendations: any[]) => {
        const businessIds = recommendations.map(r => r.businessId);

        // استدعاء جميع البزنسات الموصى بها دفعة واحدة بواسطة forkJoin
        // بدلاً من استدعاء متكرر
        if (businessIds.length > 0) {
          // استيراد forkJoin من rxjs
          import('rxjs').then(({ forkJoin }) => {
            const requests = businessIds.map(id => this.businessService.getOneBusiness(id));
            forkJoin(requests).subscribe({
              next: (businesses: IBusiness[]) => {
                this.recommendedBusinesses = businesses.filter(b => b != null);
              },
              error: err => {
                console.error('Error loading recommended businesses:', err);
              }
            });
          });
        }
      },
      error: err => {
        console.error('Error loading user recommendations:', err);
      }
    });
  }

  loadData(): void {
    this.isLoading = true;

    // جلب المستخدمين وتحديث العد والبيانات والبيانات البيانية
    this.userService.getallUsers().subscribe({
      next: users => {
        this.usersCount = users.length;
        this.allUsers = users;
        this.latestUsers = users.slice(-5).reverse();

        const adminCount = users.filter(u => u.isAdmin).length;
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
      },
      error: err => {
        console.error('Error loading users:', err);
      }
    });

    // جلب التصنيفات وعددها مع تحديث بيانات البيزنس حسب التصنيف
    this.categoryService.getallcategories().subscribe({
      next: cats => {
        this.categoriesCount = cats.length;
        this.allCategories = cats;
        this.latestCategories = cats.slice(-5).reverse();

        this.businessService.getAllBusiness().subscribe({
          next: businesses => {
            this.allBusinesses = businesses;

           const businessCountsPerCategory = cats.map((cat: ICategory) =>
  businesses.filter(b => b.categoryId === cat.categoryId).length
);


            this.categoryChartData = {
              labels: cats.map((c: ICategory) => c.name),

              datasets: [{
                data: businessCountsPerCategory,
                label: 'Businesses per Category',
                backgroundColor: '#ffc107',
                borderColor: '#ffc107',
                borderWidth: 1
              }]
            };
          },
          error: err => {
            console.error('Error loading businesses for categories:', err);
          }
        });
      },
      error: err => {
        console.error('Error loading categories:', err);
      }
    });

    // جلب البيزنس وتحديث العد والبيانات والبيانات البيانية للمدن
    this.businessService.getAllBusiness().subscribe({
      next: businesses => {
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
      },
      error: err => {
        console.error('Error loading businesses:', err);
      }
    });

    setTimeout(() => (this.isLoading = false), 1000);
  }

  viewAll(): void {
    this.showAll = !this.showAll;
  }

  refreshData(): void {
    this.loadData();
  }
}
