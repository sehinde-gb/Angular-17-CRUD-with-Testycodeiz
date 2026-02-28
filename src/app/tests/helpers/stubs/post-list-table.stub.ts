import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Post } from '../../../features/posts/models/post';

@Component({
  selector: 'app-post-list-table',
  standalone: true,
  template: `<div data-test="post-list-table">rows: {{ posts?.length ?? 0 }}</div>`
})
export class PostListTableStubComponent {
  @Input() posts: Post[] = [];
  @Output() deletePost = new EventEmitter<number>();
}
