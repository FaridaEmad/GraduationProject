import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-nav',
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './admin-nav.component.html',
  styleUrl: './admin-nav.component.scss'
})
export class AdminNavComponent {
  private readonly _AuthService = inject(AuthService)
  SignOut(): void {
    this._AuthService.logOut();
  }
  sidebarOpen = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    const sidebar = document.querySelector('.sidebar');
    if (this.sidebarOpen) {
      sidebar?.classList.add('open');
    } else {
      sidebar?.classList.remove('open');
    }
  }
}
