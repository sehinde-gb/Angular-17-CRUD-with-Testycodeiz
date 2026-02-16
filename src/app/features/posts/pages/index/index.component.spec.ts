// src/app/features/posts/pages/index/index.component.spec.ts

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { IndexComponent } from './index.component';
import { PostService } from '../../services/post.service';
import { GlobalLoadingService } from '../../../../core/services/global-loading.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Post } from '../../models/post';

/**
 * ✅ STUB CHILD COMPONENT
 * We only care that Index:
 * - renders it (or not)
 * - passes posts into it
 */
@Component({
  selector: 'app-post-list-table',
  standalone: true,
  template: `
    <div data-test="post-list-table">
      rows: {{ posts?.length ?? 0 }}
    </div>
  `,
})
class PostListTableStubComponent {
  @Input() posts: Post[] = [];
  @Output() deletePost = new EventEmitter<number>();
}

describe('IndexComponent (template states)', () => {
  let fixture: ComponentFixture<IndexComponent>;
  let component: IndexComponent;
  let postServiceSpy: jasmine.SpyObj<PostService>;

  beforeEach(async () => {
    postServiceSpy = jasmine.createSpyObj<PostService>('PostService', ['getAll', 'delete']);

    await TestBed.configureTestingModule({
      // NOTE: IndexComponent is standalone, so we import it.
      // We also import the stub so Angular can compile it.
      imports: [IndexComponent, PostListTableStubComponent],
      providers: [
        provideRouter([]),

        { provide: PostService, useValue: postServiceSpy },

        // Minimal stubs for injected services used by IndexComponent
        {
          provide: GlobalLoadingService,
          useValue: { isLoading: () => false, show: () => {}, hide: () => {} },
        },
        { provide: ToastService, useValue: { showSuccess: () => {}, showError: () => {} } },
        { provide: AuthService, useValue: { logout: () => {}, isAuthenticated: () => true } },
      ],
    })
      // ✅ CRITICAL: Override IndexComponent's imports so it uses OUR stub
      // instead of the real PostListTableComponent listed in IndexComponent decorator.
      .overrideComponent(IndexComponent, {
        set: {
          // Replaces the component's own `imports: [...]` for this test only
          imports: [PostListTableStubComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(IndexComponent);
    component = fixture.componentInstance;
  });

  it('renders the post list table when posts load successfully', () => {
    // ARRANGE
    const mockPosts: Post[] = [
      { id: 1, title: 'Hello', body: 'World' } as Post,
      { id: 2, title: 'Hi', body: 'There' } as Post,
    ];
    postServiceSpy.getAll.and.returnValue(of(mockPosts));

    // ACT (ngOnInit -> loadPosts -> subscribe -> template updates)
    fixture.detectChanges();

    // ASSERT: error state not shown
    expect(fixture.nativeElement.textContent).not.toContain("We couldn't load the posts...");

    // ASSERT: stub DOM exists
    const table = fixture.debugElement.query(By.css('[data-test="post-list-table"]'));
    expect(table).withContext(fixture.nativeElement.innerHTML).toBeTruthy();

    // ASSERT: stub instance received posts via @Input
    const childDe = fixture.debugElement.query(By.directive(PostListTableStubComponent));
    expect(childDe).not.toBeNull();

    const child = childDe!.componentInstance as PostListTableStubComponent;
    expect(child.posts.length).toBe(2);
  });

  it('renders the error state when getAll fails', () => {
    // ARRANGE
    postServiceSpy.getAll.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );

    // ACT
    fixture.detectChanges();

    // ASSERT: error UI shown
    expect(fixture.nativeElement.textContent).toContain("We couldn't load the posts...");

    // ASSERT: stub not rendered
    const childDe = fixture.debugElement.query(By.directive(PostListTableStubComponent));
    expect(childDe).toBeNull();
  });

  it('calls loadPosts() again when clicking Try Again', () => {
    // ARRANGE: first call fails -> shows error state
    postServiceSpy.getAll.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );
    fixture.detectChanges();

    // Next call succeeds on retry
    postServiceSpy.getAll.and.returnValue(
      of([{ id: 1, title: 'A', body: 'B' } as Post])
    );

    // ACT: click retry
    const btn = fixture.debugElement.query(By.css('button.btn.btn-secondary'));
    expect(btn).withContext(fixture.nativeElement.innerHTML).not.toBeNull();

    btn.nativeElement.click();
    fixture.detectChanges();

    // ASSERT
    expect(postServiceSpy.getAll).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.textContent).not.toContain("We couldn't load the posts...");
  });
});