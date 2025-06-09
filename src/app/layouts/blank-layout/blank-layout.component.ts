import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';

interface User {
  name: string;
  imageUrl: string;
}

@Component({
  selector: 'app-blank-layout',
  templateUrl: './blank-layout.component.html',
  styleUrls: ['./blank-layout.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class BlankLayoutComponent implements OnInit {
  cartCount: number = 0;
  userName: string = '';
  userImage: string = '';
  currentYear: number = new Date().getFullYear();

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    // Subscribe to cart count changes
    this.bookingService.cartCount$.subscribe((count: number) => {
      this.cartCount = count;
    });

    // Get user info from local storage or service
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr) as User;
      this.userName = user.name;
      this.userImage = user.imageUrl;
    }
  }

  logout(): void {
    this.authService.logOut();
  }
}