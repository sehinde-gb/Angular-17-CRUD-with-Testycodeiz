import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {  Observable } from 'rxjs';
import { Post } from '../models/post'
import { environment} from '../../../../environments/environment';
import {CreatePostDto, UpdatePostDto} from '../models/post.dto';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private apiURL = environment.apiUrl;


  constructor(private http: HttpClient) {}

  getAll(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiURL}/posts`);
  }

  create(payload: CreatePostDto): Observable<Post> {
    return this.http.post<Post>(`${this.apiURL}/posts`, payload);
  }

  find(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiURL}/posts/${id}`);
  }

  update(id: number, payload: UpdatePostDto): Observable<Post> {
    return this.http.put<Post>(`${this.apiURL}/posts/${id}`, payload);
  }

  // This emits either undefined or it completes this is because it uses <void> the type void means it expects undefined or success.
  delete(id: number) {
  return this.http.delete<void>(`${this.apiURL}/posts/${id}`);

  }


}
