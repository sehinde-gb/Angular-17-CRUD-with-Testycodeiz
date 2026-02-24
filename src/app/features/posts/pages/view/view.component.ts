import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalLoadingService } from '../../../../core/services/global-loading.service';
import { RouterModule } from '@angular/router';
import { Post } from '../../models/post';
import { PostDetailsCardComponent } from '../../components/post-details-card/post-details-card.component';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [RouterModule, CommonModule, PostDetailsCardComponent],
  templateUrl: './view.component.html',
  styleUrl: './view.component.css'
})
export class ViewComponent {
  public loadingService = inject(GlobalLoadingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // typed + clear states
  post = signal<Post | null>(null);
  hasError = signal<boolean>(false);

  ngOnInit():void{
      // Grab the post id from the post (resolver) or null
      const resolved = this.route.snapshot.data['post'] as Post | null;
      // If you don't have it then set error to true
      if(!resolved) {
        this.hasError.set(true);
        return;
      }
      // otherwise set the post to resolve
      this.post.set(resolved);
           
    }
      // Retry only re-navigates to the same URL and the resolver runs again.
      retry(): void {
        this.router.navigateByUrl(this.router.url);
      }

      goBack(): void {
        this.router.navigate(['/post/index']);
      }
      
      

}
