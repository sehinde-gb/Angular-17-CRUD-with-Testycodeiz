import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../../../../shared/services/toast.service';
import { finalize } from 'rxjs';
import { CreatePostDto } from '../../models/post.dto';
import { PostFormComponent } from "../../components/post-form/post-form.component";



@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, PostFormComponent],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css'
})

export class CreateComponent {
  private postService = inject(PostService);
  private route = inject(Router);
  // This line "brings in" the toast functionality
  private toast = inject(ToastService);
  
  // Local component state (Week 2)
  isSubmitting = signal(false);
  serverErrorMessage = signal<string | null>(null);

  form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required]}),
    body: new FormControl('', { nonNullable: true, validators: [Validators.required]}),
    // honeypot: new FormControl('') // Uncomment if you are using it in a template
  });

    
  submit(){
  
    this.serverErrorMessage.set(null);
 
    if (this.form.invalid){
      this.form.markAllAsTouched();
      return;
    } 
  
    // Honeypot (only if it exists in your form / template)
    // if (this.form.get('honeypot')?.value) return;

    if (this.isSubmitting()) return; // prevents double submits
       this.isSubmitting.set(true);

    //✅ Explicit DTO mapping (Phase 4.3.4)
    const dto: CreatePostDto = {
      title: this.form.controls.title.value,
      body: this.form.controls.body.value
    };

    this.postService.create(dto)
    .pipe(finalize(() => this.isSubmitting.set(false)))
    .subscribe({
        next: () => {
          this.toast.showSuccess('Post created successfully')
          this.route.navigateByUrl('/post/index');
        },
        error: (err: HttpErrorResponse) => {
          /* 2. The interceptor has already shown the toast for 401, 403, 500. 
          You only use this block for component specific logic. */
          
          if (err.status === 400 || err.status === 422) {
            // Special case Validation errors are usually handled locally
            // Rather than in a global interceptor toast.
              const msg = err.error?.message ||
                'Please check the form. Some fields are invalid.';
              this.serverErrorMessage.set(msg);
              this.form.setErrors({ serverError: true});  
            /* Note Loading service.isLoading() becomes false automatically
            because the finalize() block in your loading interceptor
            runs after this catchError block. */
          }
      }
    });
    
  }

  goBack() {
    // Check if the user has typed anything
    if (this.form.dirty) {
      const confirmLeave = confirm('You have unsaved changes. Are you sure you want to go back?');
      if (!confirmLeave) return; // Stop if they click "Cancel"
    }
    
    this.route.navigateByUrl('/post/index');
  }

  
}
