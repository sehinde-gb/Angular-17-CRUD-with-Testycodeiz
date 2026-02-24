import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { PostService } from '../../services/post.service';
import { GlobalLoadingService } from '../../../../core/services/global-loading.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { UpdatePostDto } from '../../models/post.dto';
import { PostFormComponent } from '../../components/post-form/post-form.component';
import { Post } from '../../models/post';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PostFormComponent],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css'
})
export class EditComponent {

  public loadingService = inject(GlobalLoadingService);
  private postService = inject(PostService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  id!: number;
  form!: FormGroup;

  isSubmitting = signal(false);
  hasError = signal(false);

 
  ngOnInit(): void {
    // 1) Get id from the resolver as a Post object or null
   const resolved = this.route.snapshot.data['post'] as Post | null;

    // 2) Init form
    this.form = new FormGroup({
      title: new FormControl('', { nonNullable: true, validators:[Validators.required]}),
      body: new FormControl('', { nonNullable: true, validators:[Validators.required]}),
    });

    if (!resolved) {
      this.hasError.set(true);
      return;
    }
    
    this.hasError.set(false);
     // We can assume this is an OK id retrieved from the Post object
    this.id = resolved.id; // from resolver
    this.form.patchValue({ title: resolved.title, body: resolved.body});
    this.form.markAsPristine(); // so requireDirty works
 
  }

  goBack(): void {
    if (this.form.dirty) {
      const confirmLeave = confirm('You have unsaved changes. Are you sure you want to go back?');
      if (!confirmLeave) return;
    }
    this.router.navigateByUrl('/post/index');
  }

  // on click of retry it sets the error to false and reruns the resolver
  retry(): void {
    this.hasError.set(false);
    
    // Requires onSameUrlNavigation: 'reload' app routes
   this.router.navigateByUrl(this.router.url);
    
  }

 submit(): void {

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  if (this.isSubmitting()) return;
    this.isSubmitting.set(true);

  const dto: UpdatePostDto = {
    title: this.form.get('title')?.value ?? '',
    body: this.form.get('body')?.value ?? ''
  };

  this.postService.update(this.id, dto)
    .pipe(finalize(() => this.isSubmitting.set(false)))
    .subscribe({
      next: () => {
        this.toast.showSuccess('Post updated successfully');
        this.router.navigateByUrl('post/index');
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 400 || err.status === 422) {
          this.form.setErrors({ serverError: true }); // ✅ safe
        }
      }
    });
  }
}