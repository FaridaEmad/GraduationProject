import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { IUser } from '../../core/interfaces/iuser';

@Component({
  selector: 'app-nav-blank',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './nav-blank.component.html',
  styleUrl: './nav-blank.component.scss'
})
export class NavBlankComponent implements OnInit {
  private readonly _AuthService = inject(AuthService);
  private readonly __UserService = inject(UserService);

  userPhoto: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // تأكد من أن بيانات المستخدم تم تحميلها من الـ localStorage
    this._AuthService.saveUserData();

    const loggedUser = this._AuthService.getUserData();  // نستخدم بيانات المستخدم من الخدمة

    if (loggedUser && loggedUser.email) {
      this.__UserService.getallUsers().subscribe({
        next: (users: IUser[]) => {
          const currentUser = users.find(u => u.email === loggedUser.email);
          if (currentUser && currentUser.profilePhoto) {
            this.userPhoto = currentUser.profilePhoto;
          } else {
            console.error('No profile photo found for the user.');
          }
        },
        error: err => {
          console.error('Error fetching users:', err);
        }
      });
    }
  }

  goToProfile(): void {
    this.router.navigate(['/user/profile']);
  }

  SignOut(): void {
    this._AuthService.logOut();
  }
}
