import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../models/post';


@Component({
  selector: 'app-post-details-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-details-card.component.html',
  styleUrl: './post-details-card.component.css'
})
export class PostDetailsCardComponent {
  @Input({ required: true }) post!: Post;

  // Optional: keep it as an event (so parent controls navigation)
  @Output() back = new EventEmitter<void>();
}
