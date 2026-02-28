
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { CreateComponent } from './create.component';
import { PostService } from '../../services/post.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { GlobalLoadingService } from '../../../../core/services/global-loading.service';
import { CreatePostDto } from '../../models/post.dto';
import { PostFormStubComponent } from 'src/app/tests/helpers/stubs/post-form.stub';
import { PostFormComponent } from '../../components/post-form/post-form.component';





describe('CreateComponent (container)', () => {
  let fixture: ComponentFixture<CreateComponent>;
  let component: CreateComponent;

  let postServiceSpy: jasmine.SpyObj<PostService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    postServiceSpy = jasmine.createSpyObj<PostService>('PostService', ['create']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      // ⚠️ Only import the container
      imports: [CreateComponent],
      providers: [
        provideRouter([]),
        { provide: PostService, useValue: postServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastService, useValue: { showSuccess: () => {}, showError: () => {} } },
        { provide: GlobalLoadingService, useValue: { isLoading: () => false } },
      ]
    })
      // ✅ Replace CreateComponent's real import with the stub
      .overrideComponent(CreateComponent, {
        remove: { imports: [PostFormComponent] },
        add: { imports: [PostFormStubComponent]},
      })
      .compileComponents();

    fixture = TestBed.createComponent(CreateComponent);
    component = fixture.componentInstance;
  });

  it('renders the post-form stub and passes expected inputs', () => {
    fixture.detectChanges();

    const stubDe = fixture.debugElement.query(By.directive(PostFormStubComponent));
    expect(stubDe).withContext(fixture.nativeElement.innerHTML).not.toBeNull();

    const stub = stubDe!.componentInstance as PostFormStubComponent;
    expect(stub.submitLabel).toBe("'Create Post'");
    expect(stub.requireDirty).toBeFalse();
    expect(stub.form).toBeTruthy();
  });

  it('calls PostService.create(dto) when stub emits submitForm (success path)', () => {
    fixture.detectChanges();

    // make form valid
    component.form.controls['title'].setValue('T');
    component.form.controls['body'].setValue('B');

    postServiceSpy.create.and.returnValue(of({ id: 1, title: 'T', body: 'B' } as any));

    // emit submit from stub (simulates clicking submit in presentational component)
    const stubDe = fixture.debugElement.query(By.directive(PostFormStubComponent));
    const stub = stubDe!.componentInstance as PostFormStubComponent;
    stub.submitForm.emit();

    const expectedPayload: CreatePostDto = { title: 'T', body: 'B' };
    expect(postServiceSpy.create).toHaveBeenCalledWith(expectedPayload);
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/post/index');
  });

  it('sets serverErrorMessage for 422/400 (local handling)', () => {
    fixture.detectChanges();

    component.form.controls['title'].setValue('T');
    component.form.controls['body'].setValue('B');

    postServiceSpy.create.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 422, error: { message: 'Validation failed' } }))
    );

    component.submit();

    expect(component.serverErrorMessage()).toContain('Validation failed');
    expect(component.form.errors?.['serverError']).toBeTrue();
  });
});
