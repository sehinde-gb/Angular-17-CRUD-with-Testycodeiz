import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Post } from '../../../features/posts/models/post';

@Component({
  selector: 'app-post-details-card',
  standalone: true,
  template: `
    <div data-test="post-details-stub">
      title: {{ post?.title ?? 'none' }}
      <button type="button" data-test="emit-back" (click)="back.emit()">Back</button>
    </div>
  `
})
export class PostDetailsCardStubComponent {
  @Input() post!: Post;
  @Output() back = new EventEmitter<void>();
}
