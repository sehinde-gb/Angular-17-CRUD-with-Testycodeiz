import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { IndexComponent } from './index.component';
import { Post } from '../../models/post';
import { PostService } from '../../services/post.service';
import { GlobalLoadingService } from '../../../../core/services/global-loading.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AuthService } from '../../../auth/services/auth.service';
import { PostListTableComponent } from '../../components/post-list-table/post-list-table.component';

@Component({
  selector: 'app-post-list-table',
  standalone: true,
  template: `<div data-test="post-list-table">rows: {{ posts?.length ?? 0 }}</div>`
})
class PostListTableStubComponent {
  @Input() posts: Post[] = [];
  @Output() deletePost = new EventEmitter<number>();
}

describe('IndexComponent (resolver template states)', () => {
  // These values just declare it once
  let fixture: ComponentFixture<IndexComponent>;
  let router: Router;
  let postServiceSpy: jasmine.SpyObj<PostService>;
  let component: IndexComponent;
  let routeData$: BehaviorSubject<any>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let loadingStub = { isLoading: () => false };

  beforeEach(async () => {
    // All of these values are reset before each test runs again !!!!
    routeData$ = new BehaviorSubject<any>({ postList: [] });
    toastSpy = jasmine.createSpyObj<ToastService>('ToastService', ['showSuccess', 'showError']);
    postServiceSpy = jasmine.createSpyObj<PostService>('PostService', ['delete']);
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['logout', 'isAuthenticated']);
    authSpy.isAuthenticated.and.returnValue(true);
    loadingStub.isLoading = () => false;


    await TestBed.configureTestingModule({
      imports: [IndexComponent],
      providers: [
        provideRouter([]), // ✅ real Router so RouterLink works
        // All of the items below are mocks
        { provide: ActivatedRoute, useValue: { data: routeData$.asObservable() } },
        { provide: PostService, useValue: postServiceSpy },
        { provide: GlobalLoadingService, useValue:  loadingStub },
        { provide: ToastService, useValue: toastSpy },
        { provide: AuthService, useValue: authSpy },
      ],
    })
      .overrideComponent(IndexComponent, {
        remove: { imports: [PostListTableComponent] },
        add: { imports: [PostListTableStubComponent] }
      })
      .compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    spyOn(router, 'navigate').and.resolveTo(true);
    spyOnProperty(router, 'url', 'get').and.returnValue('/post/index');

    fixture = TestBed.createComponent(IndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // ngOnInit subscribes to route.data
  });

  it('shows error UI & clicking Retry navigates to same URL', async () => {
    // 1) Arrange add error emission
    routeData$.next({ postList: null });

    // Act run lifecycle hook ngOnInit
    fixture.detectChanges();
    // Asset that the error will contain we couldnt load posts
    expect(fixture.nativeElement.textContent).toContain("We couldn't load the posts...");

    // 2) click retry
    const btn = fixture.debugElement.query(By.css('button.btn.btn-secondary'));
    expect(btn).withContext(fixture.nativeElement.innerHTML).not.toBeNull();
    btn.nativeElement.click();

    // Wait
    await fixture.whenStable();
    // Assert that the index listing page has been called
    expect(router.navigateByUrl).toHaveBeenCalledWith('/post/index');
  });

  it('shows couldnt load posts and recovers when resolver later emits posts', async () => {

    routeData$.next({ postList: null });

    // Act
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("We couldn't load the posts...");

    routeData$.next({ postList: [{ id: 1, title: 'Recovered', body: 'OK'} as Post]});

    fixture.detectChanges();
    await fixture.whenStable();

    const stubDe = fixture.debugElement.query(By.directive(PostListTableStubComponent));
    expect(stubDe).not.toBeNull();


  });

  it('shows loading row when loading=true and posts empty',  () => {
    loadingStub.isLoading = () => true;
    routeData$.next({ postList: [] });

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading posts...');
    expect(fixture.debugElement.query(By.directive(PostListTableStubComponent))).toBeNull();


  });

  it('renders the table when resolver returns posts (success state)', async () => {
    // Arrange posts mock
    const mockPosts: Post[] = [
      { id: 1, title: 'Hello', body: 'World' } as Post,
      { id: 2, title: 'Hi', body: 'There' } as Post,
    ];

    routeData$.next({ postList: mockPosts });
    // Act run lifecycle hook
    fixture.detectChanges();
    // Wait
    await fixture.whenStable();

    // Assert check the stub to see if it contains data
    const stubDe = fixture.debugElement.query(By.directive(PostListTableStubComponent));
    expect(stubDe).withContext(fixture.nativeElement.innerHTML).not.toBeNull();

    // Check the stub to see if it contains 2 stubs and it does NOT contain error message
    const stub = stubDe!.componentInstance as PostListTableStubComponent;
    expect(stub.posts.length).toBe(2);
    expect(fixture.nativeElement.textContent).not.toContain("We couldn't load the posts...");
  });

  it('renders error state when resolver returns null', async () => {
    // Arrange inject a null post listing
    routeData$.next({ postList: null });
    // Act run lifecycle hook
    fixture.detectChanges();
    // Wait
    await fixture.whenStable();

    // Assert that the text contains we couldn't load posts
    expect(fixture.nativeElement.textContent).toContain("We couldn't load the posts...");

    // Check the stub to see it it is NOT null
    const stubDe = fixture.debugElement.query(By.directive(PostListTableStubComponent));
    expect(stubDe).toBeNull();
  });

  it('deletePost calls service and updates the list & toasts success', async () => {
    // Arrange add 2 posts in to the route
    routeData$.next({
      postList: [
        { id: 1, title: 'A', body: 'B' } as Post,
        { id: 2, title: 'C', body: 'D' } as Post,
      ]
    });
    // Act run lifecycle hook
    fixture.detectChanges();

    // Run the delete method
    postServiceSpy.delete.and.returnValue(of(void 0));
    // Delete 1 post
    component.deletePost(1);
    // Act run lifecycle hook
    fixture.detectChanges();
    // Wait
    await fixture.whenStable();
    // Assert that the delete method has been called
    expect(postServiceSpy.delete).toHaveBeenCalledWith(1);

    // Check the stub to see if it is there
    const stubDe = fixture.debugElement.query(By.directive(PostListTableStubComponent));
    expect(stubDe).not.toBeNull();

    // Check to see if the post has been removed
    const stub = stubDe!.componentInstance as PostListTableStubComponent;
    expect(stub.posts.length).toBe(1);

    // Check that the toast was called with the message
    expect(toastSpy.showSuccess).toHaveBeenCalledWith('Post deleted');
  });

  it('logout calls auth.logout and navigates to /auth/login', async () => {

    component.logout();
    await fixture.whenStable();

    expect(authSpy.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
