import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { EditComponent } from './edit.component';
import { PostService } from '../../services/post.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { GlobalLoadingService } from '../../../../core/services/global-loading.service';
import { UpdatePostDto } from '../../models/post.dto';
import { PostFormComponent } from '../../components/post-form/post-form.component';
import { Post } from '../../models/post';
import { PostFormStubComponent } from 'src/app/tests/helpers/stubs/post-form.stub';



describe('EditComponent (container, resolver)', () => {
  // Test variables
  let fixture: ComponentFixture<EditComponent>;
  let component: EditComponent;
  let postServiceSpy: jasmine.SpyObj<PostService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  // ✅ single ActivatedRoute stub we can mutate per test
  // activatedRouteStub & setResolvedPost relate to | ngOnInit const resolved = this.route.snapshot.data['post']......
  const activatedRouteStub: any = {
    snapshot: {
      data: { post: null as Post | null }
    }
  };

  function setResolvedPost(post: Post | null) {
    activatedRouteStub.snapshot.data.post = post;
  }

  // TestBed setup runs before each test
  beforeEach(async () => {
    postServiceSpy = jasmine.createSpyObj<PostService>('PostService', ['update']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigateByUrl', 'navigate'], {
      url: '/post/1/edit'
    });
    routerSpy.navigateByUrl.and.resolveTo(true);
    toastSpy = jasmine.createSpyObj<ToastService>('ToastService', ['showSuccess', 'showError']);

    await TestBed.configureTestingModule({
      imports: [EditComponent],
      providers: [
        // these are the mocks...
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: PostService, useValue: postServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: GlobalLoadingService, useValue: { isLoading: () => false } },
      ],
    })
      // ✅ replace real PostFormComponent with stub
      .overrideComponent(EditComponent, {
        remove: { imports: [PostFormComponent] },
        add: { imports: [PostFormStubComponent] }
      })
      .compileComponents();
  });

  /*
    Render / Initial state
    Tests that verify the component renders correctly
    without user interaction
  */
 it('renders post-form stub and passes expected inputs when resolver provides a post', () => {
    // Arrange pass in a post sent by the resolver
    setResolvedPost({ id: 1, title: 'A', body: 'B' } as Post);

    // Build the page
    fixture = TestBed.createComponent(EditComponent);
    component = fixture.componentInstance;

    // Act run lifecycle hook
    fixture.detectChanges(); // ngOnInit runs, creates form, patches values

    // Assertion expect stub to not be null
    const stubDe = fixture.debugElement.query(By.directive(PostFormStubComponent));
    expect(stubDe).withContext(fixture.nativeElement.innerHTML).not.toBeNull();

    // And expect the label is passed from the component to the stub component
    const stub = stubDe!.componentInstance as PostFormStubComponent;
    expect(stub.submitLabel).toBe('Update Post');
    expect(stub.requireDirty).toBeTrue();
    expect(stub.form).toBeTruthy();
  });

  /*
    Success paths
    Tests that verify normal user behaviour works
  */

  it('calls PostService.update(id, dto) when stub emits submitForm (success path)', () => {
     // Arrange pass in a post sent by the resolver
    setResolvedPost({ id: 1, title: 'Old', body: 'OldBody' } as Post);

    // Call the post service and returnValue of is a fake observable that simulates the observable result that the real service will return.
    postServiceSpy.update.and.returnValue(of({} as any));

    // Create the edit component
    fixture = TestBed.createComponent(EditComponent);
    component = fixture.componentInstance;

    // Act run lifecycle hook
    fixture.detectChanges();

    // Amend the form and make it dirty + valid
    component.form.get('title')?.setValue('New');
    component.form.get('body')?.setValue('NewBody');
    component.form.markAsDirty();

    // Assert check the form and expect it to not be null
    const stubDe = fixture.debugElement.query(By.directive(PostFormStubComponent));
    expect(stubDe).not.toBeNull();

    // The ! means it isnt null and this is assigned and submitted
    const stub = stubDe!.componentInstance as PostFormStubComponent;
    stub.submitForm.emit();

    // Assert that the Dto's have passed to the stub and the update function has been called
    const expectedDto: UpdatePostDto = { title: 'New', body: 'NewBody' };
    expect(postServiceSpy.update).toHaveBeenCalledWith(1, expectedDto);
    expect(toastSpy.showSuccess).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/post/index');
  });

  it('navigates back when form clean', () => {
    // Arrange send a resolved post
    setResolvedPost({ id: 1, title: 'A', body: 'B'} as Post);

    fixture = TestBed.createComponent(EditComponent);
    component = fixture.componentInstance;

    // Act run lifecycle hook
    fixture.detectChanges();

    // Click go back
    component.goBack();

    // Assert that the post index called
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/post/index');
  });

  /*
    Error paths
    Tests that verify error handling behaviour
  */
  it('renders error state when resolver returns null', () => {
    // Arrange send a duff resolved post
    setResolvedPost(null);

    // Create the edit component
    fixture = TestBed.createComponent(EditComponent);
    component = fixture.componentInstance;

    // Act run lifescyle hook
    fixture.detectChanges();

    // Assert expect an error
    expect(component.hasError()).toBeTrue();

    // Assert stub should NOT render
    const stubDe = fixture.debugElement.query(By.directive(PostFormStubComponent));
    expect(stubDe).toBeNull();
  });

  it('sets form serverError for 400/422 on update', () => {
    // Arrange send a resolved post
    setResolvedPost({ id: 1, title: 'A', body: 'B' } as Post);

    // Send a 422 from the faked postService
    postServiceSpy.update.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 422 }))
    );

    // Create the edit component
    fixture = TestBed.createComponent(EditComponent);
    component = fixture.componentInstance;

    // Act run lifecycle hook
    fixture.detectChanges();

    // Set form properties and mark as dirty (changed)
    component.form.get('title')?.setValue('New');
    component.form.get('body')?.setValue('NewBody');
    component.form.markAsDirty();

    component.submit();

    // Expect it to error
    expect(component.form.errors?.['serverError']).toBeTrue();
  });

  it('retry() reloads the current route', () => {
    // Arrange need to simulate the hasError = true without this my test fails
    setResolvedPost(null); // error state not strictly required for calling method

    fixture = TestBed.createComponent(EditComponent);
    component = fixture.componentInstance;

    // Act run lifecycle hook
    fixture.detectChanges();

    // Click on retry
    component.retry();

    // Assert expect the navigate to edit post page
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/post/1/edit'); // routerSpy.url
  });

  it('clicking retry button calls retry()', () => {
    // Arrange need to simulate the hasError = true without this my test fails
    setResolvedPost(null); // ✅ makes hasError true -> renders Retry button

    fixture = TestBed.createComponent(EditComponent);
    component = fixture.componentInstance;

    // Act run lifecycle hook
    fixture.detectChanges();

    // Assert look for the retry button and expect the form to not be null
    const retryBtnDe = fixture.debugElement.query(By.css('button.btn.btn-outline-danger'));
    expect(retryBtnDe).withContext(fixture.nativeElement.innerHTML).not.toBeNull();

    // Click retry button
    retryBtnDe.nativeElement.click();

    // Assert expect the post edit route to have been called
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/post/1/edit');
  });





});
