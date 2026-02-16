import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { EditComponent } from './edit.component';
import { PostService } from '../../services/post.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { GlobalLoadingService } from '../../../../core/services/global-loading.service';
import { UpdatePostDto } from '../../models/post.dto';

// ✅ IMPORTANT: import the REAL presentational component so we can remove it
import { PostFormComponent } from '../../components/post-form/post-form.component';

/**
 * ✅ Stub for <app-post-form>
 * Replaces the real PostFormComponent inside EditComponent for these tests.
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

describe('EditComponent (container)', () => {
  let fixture: ComponentFixture<EditComponent>;
  let component: EditComponent;

  let postServiceSpy: jasmine.SpyObj<PostService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    postServiceSpy = jasmine.createSpyObj<PostService>('PostService', ['find', 'update']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    toastSpy = jasmine.createSpyObj<ToastService>('ToastService', ['showSuccess', 'showError']);

    await TestBed.configureTestingModule({
      imports: [EditComponent],
      providers: [
        provideRouter([]),

        // ✅ ActivatedRoute paramMap for /post/:postId/edit
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: (_key: string) => '1' } // postId = 1
            }
          }
        },

        { provide: PostService, useValue: postServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastService, useValue: toastSpy },

        // Template reads loadingService.isLoading()
        { provide: GlobalLoadingService, useValue: { isLoading: () => false } },
      ]
    })
      // ✅ swap real PostFormComponent for stub
      .overrideComponent(EditComponent, {
        remove: { imports: [PostFormComponent] },
        add: { imports: [PostFormStubComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(EditComponent);
    component = fixture.componentInstance;
  });

  it('renders post-form stub and passes expected inputs', () => {
    // ngOnInit calls loadPost -> so we must provide find() success
    postServiceSpy.find.and.returnValue(of({ id: 1, title: 'A', body: 'B' } as any));

    // This is the point where ngOnInit is run and this creates the form.
    fixture.detectChanges();

    const stubDe = fixture.debugElement.query(By.directive(PostFormStubComponent));
    expect(stubDe).withContext(fixture.nativeElement.innerHTML).not.toBeNull();

    const stub = stubDe!.componentInstance as PostFormStubComponent;
    expect(stub.submitLabel).toBe('Update Post');
    expect(stub.requireDirty).toBeTrue();
    expect(stub.form).toBeTruthy();
  });

  it('calls PostService.update(id, dto) when stub emits submitForm (success path)', () => {
    postServiceSpy.find.and.returnValue(of({ id: 1, title: 'Old', body: 'OldBody' } as any));
    postServiceSpy.update.and.returnValue(of({} as any));

    // This is the point where ngOnInit is run and this creates the form.
    fixture.detectChanges();

    // 👇 Add this guard right here
    expect(component.form).withContext('form should be created by ngOnInit').not.toBeNull();
    const form = component.form as FormGroup;

    // Make form dirty + valid
    form.controls['title'].setValue('New');
    form.controls['body'].setValue('NewBody');
    form.markAsDirty();

    const stubDe = fixture.debugElement.query(By.directive(PostFormStubComponent));
    const stub = stubDe!.componentInstance as PostFormStubComponent;

    stub.submitForm.emit();

    const expectedDto: UpdatePostDto = { title: 'New', body: 'NewBody' };
    expect(postServiceSpy.update).toHaveBeenCalledWith(1, expectedDto);
    expect(toastSpy.showSuccess).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('post/index');
  });

  it('sets hasError=true when loadPost fails (find error)', () => {
    postServiceSpy.find.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );

    // This is the point where ngOnInit is run and this creates the form.
    fixture.detectChanges(); // triggers ngOnInit -> loadPost()

    expect(component.hasError()).toBeTrue();
  });

  it('sets form serverError for 400/422 on update (local validation handling)', () => {
    postServiceSpy.find.and.returnValue(of({ id: 1, title: 'A', body: 'B' } as any));
    postServiceSpy.update.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 422 }))
    );

    // This is the point where ngOnInit is run and this creates the form.
    fixture.detectChanges();

    // 👇 Add this guard right here
    expect(component.form).withContext('form should be created by ngOnInit').not.toBeNull();
    const form = component.form as FormGroup;

    // Make form dirty + valid
    form.controls['title'].setValue('New');
    form.controls['body'].setValue('NewBody');
    form.markAsDirty();
    
  });
});