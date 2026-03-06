// src/app/core/interceptors/error.interceptor.spec.ts
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { errorInterceptor } from './error.interceptor';
import { ToastService } from '../../shared/services/toast.service';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let toastSpy: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    toastSpy = jasmine.createSpyObj<ToastService>('ToastService', ['showError', 'showSuccess']);

    TestBed.configureTestingModule({
      providers: [
        { provide: ToastService, useValue: toastSpy },

        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    // These will contain the error messages emitted to your application
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  /* NOTE In Http Requests it catches error.status however we use error.statusText to help debug
  the code when there are problems
  status => drives logic, statusText => optional metadata, flush() => simulates server response
  error() => simulates network failure
  */

  /*
    Error path
    Tests that verify error handling behaviour
  */
  it('does NOT toast for 400/422 (passes through for local handling)', () => {
    // Arrange get request to api posts with empty error message
    http.get('/api/posts').subscribe({ error: () => {} });

    // Act inject a mock
    const req = httpMock.expectOne('/api/posts');

    // req.flush pretend the server responded with this 422 Unprocessable Entity
    req.flush({ message: 'validation' }, { status: 422, statusText: 'Unprocessable Entity' });
    // Assert that the error is not called
    expect(toastSpy.showError).not.toHaveBeenCalled();
  });

  it('toasts for 500 and rethrows (POST does not retry)', () => {
    http.post('/api/posts', { title: 'T' }).subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/posts');
    // req.flush pretend the server responded with this
    req.flush({}, { status: 500, statusText: 'Server Error' });

    expect(toastSpy.showError).toHaveBeenCalledWith('Server error. Please try again later.');
  });

  it('GET retries twice on network error status 0', fakeAsync(() => {
    // Arrange set up get request and assign an empty result
    http.get('/api/posts').subscribe({ error: () => {} });

    // ACT inject mock and assign fake message for error 1 -> network error (status 0)
    const req1 = httpMock.expectOne('/api/posts');
    req1.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    tick(1000);
    // ACT retry inject mock for error 1 -> network error (status 0)
    const req2 = httpMock.expectOne('/api/posts');
    req2.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    tick(2000);
    // ACT retry inject mock and assign fake message for error 1 -> network error (status 0)
    const req3 = httpMock.expectOne('/api/posts');
    req3.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    // Assert after final failure catchError runs => toast
    expect(toastSpy.showError).toHaveBeenCalledWith(
      'Cannot connect to the server. Please check your connection.'
    );
  }));

  it('does NOT retry for POST even if 500', () => {
    http.post('/api/posts', { title: 'T' }).subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/posts');
    req.flush({}, { status: 500, statusText: 'Server Error' });

    // if it retried, another request would exist:
    httpMock.expectNone('/api/posts');
  });

  it('does NOT retry for POST even if 422 (passes through, no toast', () => {
    // Arrange set up get request and assign an empty result
    http.post('/api/posts', {title: 'T'}).subscribe({ error: () => {} });

    // Act Exactly one request happens
    const req = httpMock.expectOne('/api/posts');
    expect(req.request.method).toBe('POST');

    /* (body,options) Unprocessable entity is a label for status code 422
    code uses error.status === 422
    req.flush means pretend the server responded with this
    */
    req.flush({ Message: 'validation'}, { statusText: 'Unprocessable Entity'});

    // if retry happened, there would be another request
    httpMock.expectNone('/api/posts');

    // Assert interceptor rule no toast for 400/422
    expect(toastSpy.showError).not.toHaveBeenCalled();
  });

  it('does NOT retry for 404, but shows toast', () => {
     // Arrange set up get request to unknown url and assign an empty result
    http.get('/api/posts/999').subscribe({ error: () => {} });

    // Act inject a mock request to an unknown URL and assign fake message 404 not found
    const req1 = httpMock.expectOne('/api/posts/999');
    // req.flush pretend the server responded with this
    req1.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });

    // Assert that toast displays not found message
    expect(toastSpy.showError).toHaveBeenCalledWith('Not found');
  });

  
  /*
    Success path
    Test that verify normal user behaviour works
  */
  it('GET retries twice on 500 with backoff (1s then 2s), then succeeds', fakeAsync(() => {
    // Arrange set up get request and assign an empty result
    let result: any;
    http.get('/api/posts').subscribe((res) => (result = res));

    // ACT request 1 -> 500 inject the mock and assign fake message 500 server error
    const req1 = httpMock.expectOne('/api/posts');
    // req.flush pretend the server responded with this
    req1.flush({}, { status: 500, statusText: 'Server Error' });

    // ACT retry #1 after 1000ms repeat inject mock and assign fake message 500 server error
    tick(1000);
    const req2 = httpMock.expectOne('/api/posts');
    req2.flush({}, { status: 500, statusText: 'Server Error' });

    // ACT retry #2 after 2000ms and and assign fake message for postId 1
    tick(2000);
    const req3 = httpMock.expectOne('/api/posts');
    // req.flush pretend the server responded with this
    req3.flush([{ id: 1 }]);

    // Assert that the result is equal to the postId
    expect(result).toEqual([{ id: 1 }]);
    // No toast because we recovered successfully before catchError fired at the end
    expect(toastSpy.showError).not.toHaveBeenCalled();
  }));








});
