import { ResolveFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, of } from 'rxjs';
import { PostService } from '../services/post.service';
import { Post } from '../models/post';

export const postResolver: ResolveFn<Post | null> = (route: ActivatedRouteSnapshot) => {
  const postService = inject(PostService);
  const router = inject(Router);

  const id = Number(route.paramMap.get('postId'));

  // If id is invalid, return null (so UI can show "no post found" / error state)
  if (Number.isNaN(id) || id <= 0) {
    router.navigateByUrl('/post/index');
    return of(null);
  }
  
  return postService.find(id).pipe(
    // IMPORTANT: swallow the error so navigation still completes
    // (otherwise Angular cancels navigation and your component never loads)
    catchError(() => {
      // interceptor already toasts
      return of(null);
    })  
  );
  
};
