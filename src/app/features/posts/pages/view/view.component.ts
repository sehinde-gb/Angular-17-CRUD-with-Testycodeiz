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
      this.postId = Number(this.route.snapshot.params['postId']);      
      this.loadPost();
    }

      loadPost(): void {
        this.hasError.set(false);
        this.post.set(null);

        this.postService.find(this.postId).subscribe({
          next: (data) => {
            this.post.set(data);
          },
          // _err _ is I know the variable exists I am intentionally not using it (no error object)
          error: (_err: HttpErrorResponse) => {
            // Interceptor shows toast, but page still needs an error state.
            this.hasError.set(true);
          }
        });

      }

      goBack(): void {
        this.router.navigate(['/post/index']);
      }
      
      

}
