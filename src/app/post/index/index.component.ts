import { CommonModule } from '@angular/common';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Post } from '../models/post';
import { PostService } from '../../services/post.service';
import { GlobalLoadingService } from '../../services/global-loading.service';
import { Observable } from 'rxjs';

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
  //constructor(public postService: PostService){}

  loadingService: GlobalLoadingService = inject(GlobalLoadingService);
  hasError: WritableSignal<boolean> = signal(false); // The test looks for this transition
  isLoading: WritableSignal<boolean> = signal(false);

  ngOnInit(): void {
  
   this.loadPosts()
  }

  loadPosts(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.postService.getAll().subscribe({
      next: (data: Post[]): void => {
        this.posts.set(data);
        this.isLoading.set(false);
      },
      error: (err: Error): void => {
        this.posts.set([]);
        this.hasError.set(true); // Sets the 'error-state-container'
        this.isLoading.set(false);
      }
    })
  }

  deletePost(id: number): void {
    this.postService.delete(id).subscribe((res: any): void => {
      this.posts.update((currentPosts: Post[]) => currentPosts.filter((item: Post) => item.id !== id));
      alert("Post Deleted Successfull !.")
    })
  }
}
