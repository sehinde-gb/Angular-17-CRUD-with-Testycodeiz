import { CommonModule } from '@angular/common';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Post } from '../../models/post';
import { PostService } from '../../services/post.service';
import { GlobalLoadingService } from '../../../../core/services/global-loading.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../../shared/services/toast.service';
import { PostListTableComponent } from '../../components/post-list-table/post-list-table.component';
import { postListResolver } from '../../resolvers/postList.resolver';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, RouterModule, PostListTableComponent],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
})

export class IndexComponent {

  //posts: WritableSignal<Post[]> = signal<Post[]>([]);
  hasError: WritableSignal<boolean> = signal(false); // The test looks for this transition
  public postService = inject(PostService);
  public loadingService: GlobalLoadingService = inject(GlobalLoadingService);
  public auth = inject(AuthService);
  public postList = inject(postListResolver);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public toast = inject(ToastService);

  ngOnInit(): void {
    this.loadPosts()
  }

  loadPosts(): void {
    this.hasError.set(false);

    // Data is retrieved from the 'posts' key defined in the route config
    this.route.data.subscribe({
      next: (data) => {
        this.postList = data['postList'];
        console.log('Posts loaded successfully');

      },
      error: (_err: HttpErrorResponse): void => {
        this.postList.set([]);
        this.hasError.set(true); // Sets the 'error-state-container'
      }
    });
    
    /* this.postService.getAll().subscribe({
      next: (data: Post[]) =>{
        this.posts.set(data);
      },
      error: (_err: HttpErrorResponse): void => {
        this.posts.set([]);
        this.hasError.set(true); // Sets the 'error-state-container'    
      }
    }) */
  }

  deletePost(id: number): void {
    this.postService.delete(id).subscribe({
      next: () => {
        this.postList.update((curr:Post[])=>curr.filter(p => p.id !== id));
        this.toast.showSuccess('Post deleted');
      }
      // error -> interceptor will toast
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['./auth/login']);
  }
}
