import { Component } from '@angular/core';
import { ToastService } from './toast.service';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { CommonModule, NgFor } from '@angular/common';

@Component({
  selector: 'app-toast',
  imports: [DateFormatPipe,NgFor,CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
 constructor(public toastService: ToastService) {}
}
