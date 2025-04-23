import { authGuard } from './core/guards/auth.guard';
import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { HomeComponent as UserHome } from './user/home/home.component';
import { ProfileComponent as UserProfile } from './user/profile/profile.component';
import { BusinessComponent } from './user/business/business.component';
import { SearchByCategoryComponent } from './user/search-by-category/search-by-category.component';
import { FavoriteComponent } from './user/favorite/favorite.component';
import { BookingComponent } from './user/booking/booking.component';
import { PaymentComponent } from './user/payment/payment.component';

import { HomeComponent as AdminHome } from './admin/home/home.component';
import { ProfileComponent as AdminProfile } from './admin/profile/profile.component';
import { UserManagementComponent } from './admin/user-management/user-management.component';
import { BusinessManagementComponent } from './admin/business-management/business-management.component';
import { CategoryManagementComponent } from './admin/category-management/category-management.component';
import { OffersManagementComponent } from './admin/offers-management/offers-management.component';
import { BookingComponent as AdminBooking } from './admin/booking/booking.component';
import { PaymentComponent as AdminPayment } from './admin/payment/payment.component';

import { NotfoundComponent } from './components/notfound/notfound.component';
import { LoginComponent } from './components/login/login.component';  
import { RegisterComponent } from './components/register/register.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { BlankLayoutComponent } from './layouts/blank-layout/blank-layout.component';
import { logedGuard } from './core/guards/loged.guard';
// import { DetailComponent } from './user/detail/detail.component';
import { CategoriesComponent } from './user/categories/categories.component';
import { OfferComponent } from './user/offer/offer.component';

export const routes: Routes = [
  //Auth Layout Routes (for login and register)
  {
    path:'',component:AuthLayoutComponent,canActivate:[logedGuard] ,title:"Login",children:[
      { path: '', redirectTo: '/login', pathMatch: 'full' },
      // { path: '', redirectTo: '/user/home', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      {path:"forget", loadComponent:()=>import('./components/forget/forget.component').then((c)=> c.ForgetComponent), title:'Forget Password'}

    ]
  },
  

  // Blank Layout Routes (for User and Admin)
  {
    path:'',component:BlankLayoutComponent,canActivate:[authGuard] , title: 'home',children:[
      // User Routes
      { path: '', redirectTo: '/user/home', pathMatch: 'full' }, // Redirecting to user home
      { path: 'user/home', component: UserHome },
      { path: 'user/profile', component: UserProfile },
      { path: 'user/business', component: BusinessComponent },
      { path: 'user/category', component: CategoriesComponent },
      { path: 'user/offer/:id', component: OfferComponent },
      // { path: 'user/search', component: SearchByCategoryComponent },
      { path: 'user/favorite', component: FavoriteComponent },
      { path: 'user/booking', component: BookingComponent },
      { path: 'user/payment', component: PaymentComponent },
  
      // Admin Routes
      { path: 'admin/home', component: AdminHome },
      { path: 'admin/profile', component: AdminProfile },
      { path: 'admin/user-management', component: UserManagementComponent },
      { path: 'admin/business-management', component: BusinessManagementComponent },
      { path: 'admin/category-management', component: CategoryManagementComponent },
      { path: 'admin/offers-management', component: OffersManagementComponent },
      { path: 'admin/booking', component: AdminBooking },
      { path: 'admin/payment', component: AdminPayment },
      { path: 'register/home', component: UserHome },
    ]
  },

          // Not Found Route (for unmatched paths)
  // { path: '**', component: NotfoundComponent } // Catch-all route for 404 page

  // { path: '**', redirectTo: '/user/home' }
  { path: '**', component: NotfoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
