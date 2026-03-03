import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { GlobalLoadingService } from '../services/global-loading.service';
import { loadingInterceptor } from './loading-interceptor';

describe('loadingInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let loadingService: GlobalLoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GlobalLoadingService,
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(GlobalLoadingService);

    spyOn(loadingService, 'show').and.callThrough();
    spyOn(loadingService, 'hide').and.callThrough();
  });

  afterEach(() => {
    httpMock.verify();
  });

    it('keeps loading true until ALL concurrent requests finish', () => {

    // -------- ARRANGE --------
    // TestBed already configured
    // spies already attached
    // we have http, httpMock, loadingService ready


    // -------- ACT --------
    // Start 2 requests
    http.get('/api/a').subscribe();
    http.get('/api/b').subscribe();


    // -------- ASSERT --------
    expect(loadingService.show).toHaveBeenCalledTimes(2);


    // -------- ACT --------
    const reqA = httpMock.expectOne('/api/a');
    reqA.flush({ ok: true });


    // -------- ASSERT --------
    expect(loadingService.hide).toHaveBeenCalledTimes(1);
    expect(loadingService.isLoading()).toBeTrue();


    // -------- ACT --------
    const reqB = httpMock.expectOne('/api/b');
    reqB.flush({ ok: true });


    // -------- ASSERT --------
    expect(loadingService.hide).toHaveBeenCalledTimes(2);
    expect(loadingService.isLoading()).toBeFalse();
  });
});
