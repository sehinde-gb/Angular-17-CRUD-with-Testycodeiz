import { CommonModule } from '@angular/common';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Post } from '../../models/post';
import { PostService } from '../../services/post.service';
import { GlobalLoadingService } from '../../../../core/services/global-loading.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';


interface LoadingState {
  isLoading: boolean;
  hasError: boolean;
}

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
})

export class IndexComponent {

 
  posts: WritableSignal<Post[]> = signal<Post[]>([])
  public postService = inject(PostService);
  loadingService: GlobalLoadingService = inject(GlobalLoadingService);
  hasError: WritableSignal<boolean> = signal(false); // The test looks for this transition
  isLoading: WritableSignal<boolean> = signal(false);
  public auth = inject(AuthService);
  private router = inject(Router);


  ngOnInit(): void {
    this.loadPosts()
  }

  loadPosts(): void {
   
    this.hasError.set(false);

    this.postService.getAll().subscribe({
      next: (data) => this.posts.set(data), 
      error: (_err: HttpErrorResponse): void => {
        this.posts.set([]);
        this.hasError.set(true); // Sets the 'error-state-container'
        
      }
    })
  }

  deletePost(id: number): void {
    this.postService.delete(id).subscribe((res: any): void => {
      this.posts.update((currentPosts: Post[]) => currentPosts.filter((item: Post) => item.id !== id));
      alert("Post Deleted Successfull !.")
    })
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['./auth/login']);
  }
}
