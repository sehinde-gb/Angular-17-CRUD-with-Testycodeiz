import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './forbidden.component.html',
  styleUrl: './forbidden.component.css'
})
export class ForbiddenComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  goBack() {
    const from = this.route.snapshot.queryParamMap.get('from');
    this.router.navigateByUrl(from ?? '/post/index');
  }
}
