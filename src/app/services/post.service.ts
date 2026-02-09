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

  create(post:Post): Observable<any> {

    return this.httpClient.post(this.apiURL + '/posts/', JSON.stringify(post), this.httpOptions)

    .pipe(
      catchError(this.errorHandler)
    )
  }

  find(id:number): Observable<any> {

    return this.httpClient.get(this.apiURL + '/posts/' + id)
    //return this.httpClient.get(this.apiURL + '/posts/' + 30303)
    .pipe(
      catchError(this.errorHandler)
    )
  }

  update(id:number, post:Post): Observable<any> {

    return this.httpClient.put(this.apiURL + '/posts/' + id, JSON.stringify(post), this.httpOptions)

    .pipe(
      catchError(this.errorHandler)
    )
  }

  delete(id:number){
    return this.httpClient.delete(this.apiURL + '/posts/' + id, this.httpOptions)

    .pipe(
      catchError(this.errorHandler)
    )
  }
  errorHandler(error:any) {
    let errorMessage = '';
    if(error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
 }
}
