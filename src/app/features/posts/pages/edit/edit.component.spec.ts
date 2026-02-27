import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
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

/**
 * ✅ Stub for <app-post-form>
 * We only care that Edit passes inputs and reacts to outputs.
 */
@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div data-test="post-form-stub">
      label: {{ submitLabel }}
      <button type="button" data-test="emit-submit" (click)="submitForm.emit()">
        Emit Submit
      </button>
    </div>
  `
})
class PostFormStubComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() isSubmitting = false;
  @Input() submitLabel = 'Save';
  @Input() requireDirty = false;

  @Output() submitForm = new EventEmitter<void>();
}

describe('EditComponent (container, resolver)', () => {
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

  it('renders post-form stub and passes expected inputs when resolver provides a post', () => {
    setResolvedPost({ id: 1, title: 'A', body: 'B' } as Post);

    fixture = TestBed.createComponent(EditComponent);
    component = fixture.componentInstance;

    fixture.detectChanges(); // ngOnInit runs, creates form, patches values

    const stubDe = fixture.debugElement.query(By.directive(PostFormStubComponent));
    expect(stubDe).withContext(fixture.nativeElement.innerHTML).not.toBeNull();

    const stub = stubDe!.componentInstance as PostFormStubComponent;
    expect(stub.submitLabel).toBe('Update Post');
    expect(stub.requireDirty).toBeTrue();
    expect(stub.form).toBeTruthy();
  });

  it('calls PostService.update(id, dto) when stub emits submitForm (success path)', () => {
    setResolvedPost({ id: 1, title: 'Old', body: 'OldBody' } as Post);
    // returnValue of is a fake observable that simulates the observable result that the real service will return.
    postServiceSpy.update.and.returnValue(of({} as any));

    fixture = TestBed.createComponent(EditComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    // make it dirty + valid
    component.form.get('title')?.setValue('New');
    component.form.get('body')?.setValue('NewBody');
    component.form.markAsDirty();

    const stubDe = fixture.debugElement.query(By.directive(PostFormStubComponent));
    expect(stubDe).not.toBeNull();

    const stub = stubDe!.componentInstance as PostFormStubComponent;
    stub.submitForm.emit();


    const expectedDto: UpdatePostDto = { title: 'New', body: 'NewBody' };
    expect(postServiceSpy.update).toHaveBeenCalledWith(1, expectedDto);
    expect(toastSpy.showSuccess).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/post/index');
  });

  it('renders error state when resolver returns null', () => {
    setResolvedPost(null);

    fixture = TestBed.createComponent(EditComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.hasError()).toBeTrue();

    // stub should NOT render
    const stubDe = fixture.debugElement.query(By.directive(PostFormStubComponent));
    expect(stubDe).toBeNull();
  });

  it('sets form serverError for 400/422 on update', () => {
    setResolvedPost({ id: 1, title: 'A', body: 'B' } as Post);

    postServiceSpy.update.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 422 }))
    );

    fixture = TestBed.createComponent(EditComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    component.form.get('title')?.setValue('New');
    component.form.get('body')?.setValue('NewBody');
    component.form.markAsDirty();

    component.submit();

    expect(component.form.errors?.['serverError']).toBeTrue();
  });

  it('navigates back when form clean', () => {
    setResolvedPost({ id: 1, title: 'A', body: 'B'} as Post);

    fixture = TestBed.createComponent(EditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.goBack();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/post/index');
  });

 it('retry() reloads the current route', () => {
  // Need to simulate the hasError = true without this my test fails
    setResolvedPost(null); // error state not strictly required for calling method

    fixture = TestBed.createComponent(EditComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    component.retry();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/post/1/edit'); // routerSpy.url
  });

  it('clicking Retry button calls retry()', () => {
    // Need to simulate the hasError = true without this my test fails
    setResolvedPost(null); // ✅ makes hasError true -> renders Retry button

    fixture = TestBed.createComponent(EditComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    const retryBtnDe = fixture.debugElement.query(By.css('button.btn.btn-outline-danger'));
    expect(retryBtnDe).withContext(fixture.nativeElement.innerHTML).not.toBeNull();

    retryBtnDe.nativeElement.click();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/post/1/edit');
  });

});
