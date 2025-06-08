import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-nav',
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './admin-nav.component.html',
  styleUrls: ['./admin-nav.component.scss']
})
export class AdminNavComponent {
  isNavOpen = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  toggleNav() {
    this.isNavOpen = !this.isNavOpen;
  }

  
  closeNav() {
    this.isNavOpen = false;
  }

  SignOut() {
    this.authService.logOut();
    this.router.navigate(['/login']);
  }
}