import { Component, inject, OnInit } from '@angular/core';
import { Post } from '../models/post';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GlobalLoadingService } from '../../services/global-loading.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css'
})
export class EditComponent  {

  id!:number;
  post!:Post;
  form!:FormGroup;

  
  public loadingService = inject(GlobalLoadingService);
  public postService = inject(PostService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  ngOnInit():void{
    // 1. Get id from route
    //this.id = Number(this.route.snapshot.params['postId']);
    this.id = Number(this.route.snapshot.paramMap.get('postId'));
    console.log('Edit id:', this.id);

    // This code handles invalid ID's
    if(!this.id) {
      this.router.navigateByUrl('/post/index');
      return;
    }

    // 2. Initialise the form with empty strings so the controls exist immediately
    this.form = new FormGroup({
      title: new FormControl('', [Validators.required]),
      body: new FormControl('',Validators.required),
      // honeypot: new FormControl('') // only if you use in the template
    });  

    
    // 3. Fetch the data (Interceptor triggers isLoading automatically)
    this.postService.find(this.id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.form.markAsPristine();
      },
      error: () => {
        // interceptor already toasts
        this.form.setErrors({ loadFailed: true});

      }
    });
    
  }

  get f(){
      return this.form.controls;
    }

  goBack() {
    // Check if the user has typed anything
    if (this.form.dirty) {
      const confirmLeave = confirm('You have unsaved changes. Are you sure you want to go back?');
      if (!confirmLeave) return; // Stop if they click "Cancel"
    }
    
    this.router.
    navigateByUrl('/post/index');
  }

  submit() {
      if (this.form.invalid) {
          this.form.markAllAsTouched();
          return;
      }

      if (this.loadingService.isLoading()) return;
        
      // if (this.form.get('honeypot')?.value) return;

      this.postService.update(this.id, this.form.value).subscribe({
        next: () => {
          this.toast.showSuccess('Post updated successfully');
          this.router.navigateByUrl('post/index');

        },
        error: (err) => {
          // interceptor already toasts; keep local handling only for validation
          if (err.status === 400 || err.status === 422) {
            this.form.setErrors({ serverError: true });
          }
        }
      });

    }

    
  }

 


  

  
