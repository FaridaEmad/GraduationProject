import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-nav-blank',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './nav-blank.component.html',
  styleUrl: './nav-blank.component.scss'
})
export class NavBlankComponent implements OnInit {
  private readonly _AuthService = inject(AuthService);
  userPhoto: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this._AuthService.saveUserData();
    const user = this._AuthService.getUserData();
    console.log('userPhoto:', this.userPhoto);

    if (user && user.profilePhoto) {
      this.userPhoto = user.profilePhoto;
    }
  }

  goToProfile(): void {
    this.router.navigate(['/user/profile']);
  }

  SignOut(): void {
    this._AuthService.logOut();
  }
}
