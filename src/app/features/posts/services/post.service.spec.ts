import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { PostService } from './post.service';
import { Post } from '../models/post';
import { CreatePostDto } from '../models/post.dto';
import { UpdatePostDto } from '../models/post.dto';

describe('PostService', () => {
  let service: PostService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PostService],
    });

    service = TestBed.inject(PostService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create a post (POST)', () => {
    // ARRANGE
    const payload: CreatePostDto = {
      title: 'New Title',
      body: 'New body',
    };

    const mockResponse: Post = {
      id: 101,
      title: payload.title,
      body: payload.body,
    } as Post;

    let actual!: Post;

    // ACT
    service.create(payload).subscribe((res) => {
      actual = res;
    });

    // ASSERT
    const req = httpMock.expectOne(`${environment.apiUrl}/posts`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    // FLUSH Response to API
    req.flush(mockResponse);

    expect(actual).toEqual(mockResponse);
  });

  it('should fetch all posts (GET)', () => {
    // ARRANGE
    const mockPosts: Post[] = [
      { id: 1, title: 'Post 1', body: 'Body 1' } as Post,
      { id: 2, title: 'Post 2', body: 'Body 2' } as Post,
    ];

    // ACT
    service.getAll().subscribe((posts) => {
      expect(posts.length).toBe(2);
      expect(posts).toEqual(mockPosts);
    });

   // ASSERT
    const req = httpMock.expectOne(`${environment.apiUrl}/posts`);
    expect(req.request.method).toBe('GET');

    // FLUSH response to mock API
    req.flush(mockPosts);
  });


  it('should fetch a single post by id (GET)', () => {
    // ARRANGE
    const mockPost: Post = {
      id: 1,
      title: 'Post',
      body: 'Body'
    } as Post;

    // ACT
    service.find(1).subscribe((post) => {
      expect(post).toEqual(mockPost);
    });

    // ASSERT
    const req = httpMock.expectOne(`${environment.apiUrl}/posts/1`);
    expect(req.request.method).toBe('GET');

    // Response from mock API
    req.flush(mockPost);
  });

  it('it should update a post (PUT)', () => {
    // ARRANGE
    const payload: UpdatePostDto = {
      title: 'Updated Title',
      body: 'Updated Body'
    };

    const mockResponse: Post = {
      id: 1,
      title: payload.title,
      body: payload.body
    } as Post;

    // ACT
    service.update(1, payload).subscribe((post) =>{
      expect(post).toEqual(mockResponse);
    });

    // ASSERT
    const req = httpMock.expectOne(`${environment.apiUrl}/posts/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);

    // FLUSH
    req.flush(mockResponse);

  });


  it('it should delete a post (DELETE)', () => {
    // ARRANGE
    const postId = 1;
    
    // ACT
    service.delete(postId).subscribe((res) =>{
      expect(res).toBeTruthy();
    });

    //EXPECT
    const req = httpMock.expectOne(`${environment.apiUrl}/posts/1`);
    expect(req.request.method).toBe('DELETE');
    


    // FLUSH
    req.flush({});

  });
});