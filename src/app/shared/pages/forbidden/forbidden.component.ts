import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './forbidden.component.html',
  styleUrl: './forbidden.component.css',
})
export class ForbiddenComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // e.g. /forbidden?from=/admin
  private from = this.route.snapshot.queryParamMap.get('from');

  goBack(): void {
    this.router.navigateByUrl(this.from ?? '/post/index');
  }
}
