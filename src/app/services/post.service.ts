import { effect, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {  Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { Post } from '../post/models/post';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private apiURL = "https://jsonplaceholder.typicode.com";

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

  isLocalLoading = signal<boolean>(false);
  postService: any;

  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<any> {
    this.isLocalLoading.set(true);
    
    return this.httpClient.get(this.apiURL + '/posts/')
    .pipe(
      finalize(() => this.isLocalLoading.set(false))
      
    )
  }


  create(post: Post): Observable<Post>{
    return this.httpClient.post<Post>(`$this{this.apiURL}/posts/`, post);
  }



  find(id: number): Observable<Post> {
    return this.httpClient.get<Post>(`${this.apiURL}/posts/${id}`);
  }

  update(id:number, post:Post): Observable<Post> {

    return this.httpClient.put<Post>(`${this.apiURL}/posts/${id}`, post)

    
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiURL}/posts/${id}`, this.httpOptions);

   
  }
  
}
