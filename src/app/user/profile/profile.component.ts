import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { routes } from '../../app.routes';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  userName = localStorage.getItem('userName');
  userEmail = localStorage.getItem('userEmail');
  userPhoto = localStorage.getItem('userPhoto');

  constructor(public authService: AuthService) { }
}
