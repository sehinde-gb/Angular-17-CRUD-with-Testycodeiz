import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { PostFormComponent } from './post-form.component';

describe('PostFormComponent', () => {
  let component: PostFormComponent;
  let fixture: ComponentFixture<PostFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostFormComponent);
    component = fixture.componentInstance;

    component.form = new FormGroup({
      title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      body: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    });

    component.submitLabel = 'Create Post';
    component.isSubmitting = false;
    component.requireDirty = false;

    fixture.detectChanges();
  });



  function getSubmitBtn(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement as HTMLButtonElement;
  }

  function getTitleInput(): HTMLInputElement {
    return fixture.debugElement.query(By.css('input#title')).nativeElement as HTMLInputElement;
  }

  function getBodyInput(): HTMLInputElement {
    return fixture.debugElement.query(By.css('input#body')).nativeElement as HTMLInputElement;
  }

  it('renders submitLabel when not submitting', () => {
    const btn = getSubmitBtn();
    expect(btn.textContent?.trim()).toBe('Create Post');
  });

  it('shows "Saving..." when isSubmitting=true', () => {
    component.isSubmitting = true;
    fixture.detectChanges();

    const btn = getSubmitBtn();
    expect(getSubmitBtn().textContent?.trim()).toBe('Saving...');
  });

  it('sets inputs to readOnly when isSubmitting=true', () => {
    component.isSubmitting = true;
    fixture.detectChanges();

    expect(getTitleInput().readOnly).toBeTrue();
    expect(getBodyInput().readOnly).toBeTrue();
  });

  it('emits submitForm on ngSubmit', () => {
    spyOn(component.submitForm, 'emit');

    // make the form valid
    component.form.controls['title'].setValue('T');
    component.form.controls['body'].setValue('B');
    fixture.detectChanges();

    // Trigger ngSubmit (don’t click the button; submit the form)
    fixture.debugElement.query(By.css('form')).triggerEventHandler('ngSubmit', {});


    expect(component.submitForm.emit).toHaveBeenCalledTimes(1);
  });

  it('disables submit when form is invalid', () => {
    // invalid by default (required fields empty)
    fixture.detectChanges();

    const btn = getSubmitBtn();
    expect(component.form.invalid).toBeTrue();
    expect(btn.disabled).toBeTrue();
  });

  it('disables submit when isSubmitting=true even if form is valid', () => {
    component.form.controls['title'].setValue('T');
    component.form.controls['body'].setValue('B');
    component.isSubmitting = true;
    fixture.detectChanges();

    expect(component.form.valid).toBeTrue();
    expect(getSubmitBtn().disabled).toBeTrue();
  });

  it('when requireDirty=true, disables submit until form is dirty', () => {
    component.requireDirty = true;

    component.form.controls['title'].setValue('T');
    component.form.controls['body'].setValue('B');
    component.form.markAsPristine(); // ensure NOT dirty
    fixture.detectChanges();

    expect(getSubmitBtn().disabled).toBeTrue();

    component.form.markAsDirty();
    fixture.detectChanges();

    expect(getSubmitBtn().disabled).toBeFalse();
  });

  it('does NOT show validation messages when invalid but untouched', () => {
    // invalid, but untouched by default
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Title is required');
    expect(fixture.nativeElement.textContent).not.toContain('Body is required');
  });

  it('shows "Title is required" when title is touched and invalid', () => {
    component.form.controls['title'].setValue(''); // required error
    component.form.controls['title'].markAsTouched();

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Title is required');
  });

  it('shows "Body is required" when body is touched and invalid', () => {
    component.form.controls['body'].markAsTouched();
    component.form.controls['body'].setValue('');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Body is required');
  });
});
