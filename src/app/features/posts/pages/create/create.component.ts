import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { Router } from '@angular/router';
import { GlobalLoadingService } from '../../../../core/services/global-loading.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../../../../shared/services/toast.service';
import { finalize } from 'rxjs';



@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css'
})
export class CreateComponent {
  form!:FormGroup;
  public loadingService = inject(GlobalLoadingService); // Inject here
  private postService = inject(PostService);
  private route = inject(Router);
  // This line "brings in" the toast functionality
  private toast = inject(ToastService);


  // Local component state (Week 2)
  isSubmitting = signal(false);
  serverErrorMessage = signal<string | null>(null);

  ngOnInit():void{
    this.form = new FormGroup({
      title: new FormControl('', [Validators.required]),
      body: new FormControl('',Validators.required),
      // honeypot: new FormControl('') // Uncomment if you are using it in a template
    });
  }

  get f(){
    return this.form.controls;
  }

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
    
    this.postService.create(this.form.value).pipe(
      finalize(() => this.isSubmitting.set(false))
      ).subscribe({
        next: (res) => {
          this.toast.showSuccess('Post created successfully')
          this.route.navigateByUrl('post/index');
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
