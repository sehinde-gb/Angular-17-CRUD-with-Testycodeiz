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

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PostFormComponent],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css'
})
export class EditComponent {

  id!: number;
  form: FormGroup | null = null;

  public loadingService = inject(GlobalLoadingService);
  private postService = inject(PostService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  isSubmitting = signal(false);
  hasError = signal(false);

  ngOnInit(): void {
    // 1) Get id from route
    this.id = Number(this.route.snapshot.paramMap.get('postId'));

    // ✅ Correct invalid ID handling
    if (Number.isNaN(this.id) || this.id <= 0) {
      this.router.navigateByUrl('/post/index');
      return;
    }

    // 2) Init form
    this.form = new FormGroup({
      title: new FormControl('', [Validators.required]),
      body: new FormControl('', [Validators.required]),
    });

    // 3) Fetch data
    this.loadPost();
  }

  // ✅ MUST be a class method (not inside ngOnInit)
  loadPost(): void {
    this.hasError.set(false);

    this.postService.find(this.id).subscribe({
      next: (data) => {
        this.form?.patchValue(data);
        this.form?.markAsPristine(); // so requireDirty works properly
      },
      error: () => {
        // interceptor already toasts globally
        this.hasError.set(true);
      }
    });
  }

  goBack(): void {
    if (this.form?.dirty) {
      const confirmLeave = confirm('You have unsaved changes. Are you sure you want to go back?');
      if (!confirmLeave) return;
    }
    this.router.navigateByUrl('/post/index');
  }

 submit(): void {
  if (!this.form) return; // ✅ guard for TS + safety

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  if (this.isSubmitting()) return;
  this.isSubmitting.set(true);

  const payload: UpdatePostDto = {
    title: this.form.get('title')?.value ?? '',
    body: this.form.get('body')?.value ?? ''
  };

  this.postService.update(this.id, payload)
    .pipe(finalize(() => this.isSubmitting.set(false)))
    .subscribe({
      next: () => {
        this.toast.showSuccess('Post updated successfully');
        this.router.navigateByUrl('post/index');
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 400 || err.status === 422) {
          this.form?.setErrors({ serverError: true }); // ✅ safe
        }
      }
    });
  }
}