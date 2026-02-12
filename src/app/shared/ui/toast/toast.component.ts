
import { Component, inject } from '@angular/core';
import { ToastService } from '../.././/services/toast.service';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations'; // Add this

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
  animations: [
    trigger('toastAnimation', [
      // 1. Enter Animation (Slide in from right)
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      // 2. Exit Animation (Slide out to right)
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastComponent {
  // Inject the service to access the currentToast signal
  public toastService = inject(ToastService);
}