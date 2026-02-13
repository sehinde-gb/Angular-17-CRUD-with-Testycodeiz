
import {Post} from '../models/post'
export type CreatePostDto = Pick<Post, 'title' | 'body'>;
export type UpdatePostDto = Pick<Post, 'title' | 'body'>;