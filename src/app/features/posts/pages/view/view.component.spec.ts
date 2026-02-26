import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { PostDetailsCardComponent } from '../../components/post-details-card/post-details-card.component';
import { ViewComponent } from './view.component';
import { Post } from '../../models/post';
import { GlobalLoadingService } from '../../../../core/services/global-loading.service';

/**
 * ✅ Stub for <app-post-details-card>
 * We do NOT test the presentational component here.
 * We only test that ViewComponent:
 * - renders it when resolver gives a Post
 * - passes the Post input
 * - responds to (back) output
 * Presentational fake component listed below
 */
@Component({
  selector: 'app-post-details-card',
  standalone: true,
  template: `
    <div data-test="post-details-stub">
      title: {{ post?.title ?? 'none' }}
      <button type="button" data-test="emit-back" (click)="back.emit()">Back</button>
    </div>
  `
})
class PostDetailsCardStubComponent {
  @Input() post!: Post;
  @Output() back = new EventEmitter<void>();
}

/* This is the end of the stub component
*/

describe('ViewComponent (resolver + template states)', () => {
  let fixture: ComponentFixture<ViewComponent>;
  let component: ViewComponent;
  let routerSpy: jasmine.SpyObj<Router>;

  /* Overrides the real Post resolver BEFORE component is created
 this is a simulation of the Post resolver simulation the result route.snapshot.data['post'] */
 function setupWithResolvedPost(resolvedPost: Post | null) {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: {
        snapshot: {
          data: { post: resolvedPost }

        }
      }
    });
  }
  // Inject the spy and navigate to the first post view page
  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl'], {
      url: '/post/1/view'
    });

    /* imports the view component, stub and uses provideRouter as a spy
    and a stub is used for GlobalLoading Service where a value is set to a boolean */
    await TestBed.configureTestingModule({
      imports: [ViewComponent, PostDetailsCardStubComponent],
      providers: [
        provideRouter([]),
        // These are all the fakes.......
        // ✅ ViewComponent injects Router
        { provide: Router, useValue: routerSpy },

        // ✅ View template checks loadingService.isLoading()
        { provide: GlobalLoadingService, useValue: { isLoading: () => false } },

        // ✅ ActivatedRoute will be overridden per test via setupWithResolvedPost()
        {
          provide: ActivatedRoute,
         useValue: { snapshot: { data: { post: null } } }
        }
      ]
    })
      // ✅ Swap real PostDetailsCardComponent (imported by ViewComponent)
      .overrideComponent(ViewComponent, {
        remove: { imports: [PostDetailsCardComponent]},
        add: { imports: [PostDetailsCardStubComponent] }
      })
      .compileComponents();
  });

  it('renders the details stub and passes the resolved post (success path)', () => {
    const resolved: Post = { id: 1, title: 'Hello', body: 'World' } as Post;
    setupWithResolvedPost(resolved);

    // The view component is instantiated
    fixture = TestBed.createComponent(ViewComponent);
    component = fixture.componentInstance;

    // Showtime
    fixture.detectChanges(); // ngOnInit -> reads resolver -> sets post signal

    // ✅ stub is present and no null elements
    const stubDe = fixture.debugElement.query(By.directive(PostDetailsCardStubComponent));
    expect(stubDe).withContext(fixture.nativeElement.innerHTML).not.toBeNull();

    const stub = stubDe!.componentInstance as PostDetailsCardStubComponent;

    // ✅ check to see if input passed correctly
    expect(stub.post.title).toBe('Hello');
    expect(stub.post.body).toBe('World');

    // ✅ should not show error text
    expect(fixture.nativeElement.textContent).not.toContain("We couldn't load this post.");
  });

  it('renders error state when resolver returns null', () => {
    // ARRANGE
    setupWithResolvedPost(null);

    fixture = TestBed.createComponent(ViewComponent);
    component = fixture.componentInstance;

    // Showtime ACT
    fixture.detectChanges();

    // ASSERT
    expect(fixture.nativeElement.textContent).toContain("We couldn't load this post.");

    // ✅ stub should NOT render
    const stubDe = fixture.debugElement.query(By.directive(PostDetailsCardStubComponent));
    expect(stubDe).toBeNull();
  });

  it('calls goBack() when child emits back', () => {
    // ARRANGE
    const resolved: Post = { id: 1, title: 'Hello', body: 'World' } as Post;
    setupWithResolvedPost(resolved);

    fixture = TestBed.createComponent(ViewComponent);
    component = fixture.componentInstance;

    // Showtime
    fixture.detectChanges();

    const stubDe = fixture.debugElement.query(By.directive(PostDetailsCardStubComponent));
    const stub = stubDe!.componentInstance as PostDetailsCardStubComponent;

    // ACT: child event
    stub.back.emit();

    // ASSERT: parent navigation
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/post/index']);
  });
});
