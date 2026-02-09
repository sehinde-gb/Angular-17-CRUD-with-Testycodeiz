import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { Router } from '@angular/router';
import { GlobalLoadingService } from '../../services/global-loading.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';




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

  ngOnInit():void{
    this.form = new FormGroup({
      title: new FormControl('', [Validators.required]),
      body: new FormControl('',Validators.required)
    })
  }

  get f(){
    return this.form.controls;
  }

  submit(){
    console.log(this.form.value);

    
    
    if (this.form.invalid) return;
    // if the hidden field has a value, it's a bot!
    // if (this.form.get('honeypot')?.value) return;

    console.log('Submit button clicked!'); // Does this show up in the Playwright Console tab?
    this.postService.create(this.form.value).subscribe({
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
