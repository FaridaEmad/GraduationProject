import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-nav-blank',
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './nav-blank.component.html',
  styleUrl: './nav-blank.component.scss'
})
export class NavBlankComponent {

  private readonly _AuthService = inject(AuthService)

  SignOut(): void {
    this._AuthService.logOut();  // استدعاء logOut من الـ AuthService
  }
  

}
