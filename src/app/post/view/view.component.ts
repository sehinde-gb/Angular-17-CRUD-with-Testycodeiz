import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Post } from '../models/post';
import { PostService } from '../../services/post.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalLoadingService } from '../../services/global-loading.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './view.component.html',
  styleUrl: './view.component.css'
})
export class ViewComponent {



  post = signal<any>(null);

  public loadingService = inject(GlobalLoadingService);
  private postService = inject(PostService);
  private route = inject(ActivatedRoute);



  ngOnInit():void{
   

      const id = this.route.snapshot.params['postId'];

      // 2. Fetch the data
      // The loading Interceptor automatically handles the spinner
      this.postService.find(id).subscribe({
        next: (data) => {
          this.post.set(data);
        },
        error: (err) => {
          // Error interceptor handles the toast notification
        }
      });

    
  }

}
