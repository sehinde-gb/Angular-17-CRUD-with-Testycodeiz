import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService } from '../../services/post.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalLoadingService } from '../../../../core/services/global-loading.service';
import { RouterModule } from '@angular/router';
import { Post } from '../../models/post';
import { HttpErrorResponse } from '@angular/common/http';
import { PostDetailsCardComponent } from '../../components/post-details-card/post-details-card.component';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [RouterModule, CommonModule, PostDetailsCardComponent],
  templateUrl: './view.component.html',
  styleUrl: './view.component.css'
})
export class ViewComponent {
  // typed + clear states
  post = signal<Post | null>(null);
  hasError = signal<boolean>(false);

  private postId!: number;
  public loadingService = inject(GlobalLoadingService);
  private postService = inject(PostService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);


  ngOnInit():void{
      // Post is already resolved by the resolver
      //const resolved = this.route.snapshot.data['post'];
      const resolved = this.route.snapshot.data['post'] as Post | null;
      this.post.set(resolved);
     
      // choose your meaning:
      // - null means "not found" OR "failed"
      // If you want null to be treated as an error state:
      this.hasError.set(resolved === null);

      
    }
      // Retry only re-navigates to the same URL and the resolver runs again.
      loadPost(): void {
        this.hasError.set(false);
        this.router.navigateByUrl(this.router.url);

      }

      retry(): void {
        this.router.navigate(['/post/index']);
      }
      
      

}
