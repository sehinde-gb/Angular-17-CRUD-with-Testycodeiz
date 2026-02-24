import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './post-form.component.html',
  styleUrl: './post-form.component.css'
})
export class PostFormComponent {

  @Input({ required: true }) form!: FormGroup;

  // UI state controlled by parent
  @Input() isSubmitting = false;

  // Text differs for create vs edit
  @Input() submitLabel = 'Save';

  @Input() requireDirty = false;

  @Output() submitForm = new EventEmitter<void>();


  // Helper to avoid repeating casting in template
  get f() {
    return this.form.controls;
  }
}
