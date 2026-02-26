import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, of } from 'rxjs';

import { PostService } from '../services/post.service';
import { Post } from '../models/post';

export const postListResolver: ResolveFn<Post[] | null> = () => {
  const postService = inject(PostService);

  return postService.getAll().pipe(
    catchError(() => of(null))
  );
};
