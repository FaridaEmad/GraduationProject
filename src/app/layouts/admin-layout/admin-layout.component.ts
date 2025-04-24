import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminNavComponent } from "../../components/admin-nav/admin-nav.component";

@Component({
  selector: 'app-admin-layout',
  imports: [RouterModule, AdminNavComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {

}
