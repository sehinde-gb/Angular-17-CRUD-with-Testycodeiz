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
  let fixture: ComponentFixture<IndexComponent>;
  let router: Router;
  let postServiceSpy: jasmine.SpyObj<PostService>;
  let component: IndexComponent;
  let routeData$: BehaviorSubject<any>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    routeData$ = new BehaviorSubject<any>({ postList: [] });

    toastSpy = jasmine.createSpyObj<ToastService>('ToastService', ['showSuccess', 'showError']);
    postServiceSpy = jasmine.createSpyObj<PostService>('PostService', ['delete']);
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['logout', 'isAuthenticated']);
    authSpy.isAuthenticated.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [IndexComponent],
      providers: [
        provideRouter([]), // ✅ real Router so RouterLink works
        { provide: ActivatedRoute, useValue: { data: routeData$.asObservable() } },
        { provide: PostService, useValue: postServiceSpy },
        { provide: GlobalLoadingService, useValue: { isLoading: () => false } },
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

  it('clicking retry calls retry() and can recover when new route data arrives', async () => {
    // 1) error emission
    routeData$.next({ postList: null });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("We couldn't load the posts...");

    // 2) click retry
    const btn = fixture.debugElement.query(By.css('button.btn.btn-secondary'));
    expect(btn).withContext(fixture.nativeElement.innerHTML).not.toBeNull();
    btn.nativeElement.click();

    await fixture.whenStable();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/post/index');

    // 3) recovery emission
    routeData$.next({
      postList: [{ id: 1, title: 'Recovered', body: 'OK' } as Post]
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const stubDe = fixture.debugElement.query(By.directive(PostListTableStubComponent));
    expect(stubDe).withContext(fixture.nativeElement.innerHTML).not.toBeNull();

    const stub = stubDe!.componentInstance as PostListTableStubComponent;
    expect(stub.posts.length).toBe(1);
    expect(fixture.nativeElement.textContent).not.toContain("We couldn't load the posts...");
  });

  it('renders the table when resolver returns posts (success state)', async () => {
    const mockPosts: Post[] = [
      { id: 1, title: 'Hello', body: 'World' } as Post,
      { id: 2, title: 'Hi', body: 'There' } as Post,
    ];

    routeData$.next({ postList: mockPosts });
    fixture.detectChanges();
    await fixture.whenStable();

    const stubDe = fixture.debugElement.query(By.directive(PostListTableStubComponent));
    expect(stubDe).withContext(fixture.nativeElement.innerHTML).not.toBeNull();

    const stub = stubDe!.componentInstance as PostListTableStubComponent;
    expect(stub.posts.length).toBe(2);
    expect(fixture.nativeElement.textContent).not.toContain("We couldn't load the posts...");
  });

  it('renders error state when resolver returns null', async () => {
    routeData$.next({ postList: null });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain("We couldn't load the posts...");

    const stubDe = fixture.debugElement.query(By.directive(PostListTableStubComponent));
    expect(stubDe).toBeNull();
  });

  it('deletePost calls service and updates the list & toasts success', async () => {
    routeData$.next({
      postList: [
        { id: 1, title: 'A', body: 'B' } as Post,
        { id: 2, title: 'C', body: 'D' } as Post,
      ]
    });
    fixture.detectChanges();

    postServiceSpy.delete.and.returnValue(of(void 0));

    component.deletePost(1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(postServiceSpy.delete).toHaveBeenCalledWith(1);

    const stubDe = fixture.debugElement.query(By.directive(PostListTableStubComponent));
    expect(stubDe).not.toBeNull();

    const stub = stubDe!.componentInstance as PostListTableStubComponent;
    expect(stub.posts.length).toBe(1);

    expect(toastSpy.showSuccess).toHaveBeenCalledWith('Post deleted');
  });

  it('logout calls auth.logout and navigates to /auth/login', async () => {
    component.logout();
    await fixture.whenStable();

    expect(authSpy.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
