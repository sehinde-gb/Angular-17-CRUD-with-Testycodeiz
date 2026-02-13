import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Post } from "../../models/post";


@Component({
  selector: 'app-post-list-table',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-list-table.component.html',
  styleUrl: './post-list-table.component.css'
})
export class PostListTableComponent {
  // Inputs (data)
  @Input() posts: Post[] = [];
  @Output() deletePost = new EventEmitter<number>();

}
