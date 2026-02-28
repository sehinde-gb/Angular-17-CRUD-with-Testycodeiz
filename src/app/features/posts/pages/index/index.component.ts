import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Post } from '../../models/post';
import { PostService } from '../../services/post.service';
import { GlobalLoadingService } from '../../../../core/services/global-loading.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { PostListTableComponent } from '../../components/post-list-table/post-list-table.component';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, RouterModule, PostListTableComponent],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css',
})
export class IndexComponent {
  // ✅ template calls postList() and hasError()
  postList = signal<Post[]>([]);
  hasError = signal(false);

  public loadingService = inject(GlobalLoadingService);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postService = inject(PostService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
  this.hasError.set(false);

  this.route.data.subscribe((data) => {
    const posts = data['postList'] as Post[] | null | undefined;

    // error state (resolver returned null/undefined)
    if (!Array.isArray(posts)) {
      this.postList.set([]);
      this.hasError.set(true);
      return;
    }

    // success state
    this.postList.set(posts);
    this.hasError.set(false);
  });
}

  // ✅ Use this for retry if you want resolver to re-run
  retry(): void {
    this.router.navigateByUrl(this.router.url);
  }

  deletePost(id: number): void {
    this.postService.delete(id).subscribe({
      next: () => {
        this.postList.update(curr => curr.filter(p => p.id !== id));
        this.toast.showSuccess('Post deleted');
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
