import { ToastService } from './shared/toast/toast.service';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavAuthComponent } from "./components/nav-auth/nav-auth.component";
import { ToastComponent } from "./shared/toast/toast.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'GraduationProject';

}
