import { Component, inject, OnInit } from '@angular/core';
import { Post } from '../post';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PostService } from '../post.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GlobalLoadingService } from '../../global-loading.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
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
    this.id = this.route.snapshot.params['postId'];

    // 2. Initialise the form with empty strings so the controls exist immediately
    this.form = new FormGroup({
      title: new FormControl('', [Validators.required]),
      body: new FormControl('',Validators.required)
    });  

    
  

    // 3. Fetch the data (Interceptor triggers isLoading automatically)
    this.postService.find(this.id).subscribe((data) =>{
      this.form.patchValue(data); // Fill the form with existing data
     
    });

    
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

    get f(){
      return this.form.controls;
    }
    submit() {
      if (this.form.invalid) return;
      // if the hidden field has a value, it's a bot!
      if (this.form.get('honeypot')?.value) return;
      
      // 4. Update data
      this.postService.update(this.id, this.form.value).subscribe({
      next: (res) => {
        this.toast.showSuccess('Post updated successfully');
        this.router.navigateByUrl('post/index');
      /*  error: (err) => {
          // Error Interceptor handles the toast automatically
        } */
      }
    })

    
  }

 


  

  /* get f(){
    return this.form.controls;
  }
   submit(){
    console.log(this.form.value)
    this.postService.update(this.id,this.form.value).subscribe((res:any)=>{
      alert("Data Updated Successfull ☺");
      this.router.navigateByUrl('post/index')
    })
   } */
}
