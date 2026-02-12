import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {  Observable } from 'rxjs';
import { Post } from '../models/post'
import { environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private apiURL = environment.apiUrl;

  /*------------------------------------------
  --------------------------------------------
  Http Header Options
  --------------------------------------------
  --------------------------------------------*/
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  constructor(private httpClient: HttpClient) {}
  
  getAll(): Observable<Post[]> {
    return this.httpClient.get<Post[]>(`${this.apiURL}/posts/`);
  }

  create(post: Post): Observable<Post>{
    return this.httpClient.post<Post>(`${this.apiURL}/posts/`, post);
  }

  find(id: number): Observable<Post> {
    return this.httpClient.get<Post>(`${this.apiURL}/posts/${id}`);
  }

  update(id: number, post: Post): Observable<Post> {
  return this.httpClient.put<Post>(`${this.apiURL}/posts/${id}`, post, this.httpOptions);
}

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiURL}/posts/${id}`, this.httpOptions);

   
  }
  
}
