import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { GlobalLoadingService } from './services/global-loading.service';
import { ToastComponent } from './toast/toast.component';
import { HeaderComponent } from './shared/layout/header/header.component';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [CommonModule, RouterOutlet,ToastComponent, HeaderComponent ]
})
export class AppComponent {
  title = 'crudv17';
  // Inject the service to access the loading signal
  loadingService = inject(GlobalLoadingService);
}
