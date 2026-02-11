import { Component, inject } from '@angular/core';
import { AuthService } from '../../../features/auth/services/auth.service';
import { TokenStorageService } from '../../../features/auth/services/token-storage.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  public auth = inject(AuthService);
  private router = inject(Router);
  private storage = inject(TokenStorageService);

  get role(): string | null {
    return this.storage.getRole();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
