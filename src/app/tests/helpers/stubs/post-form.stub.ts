import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-post-form',
  standalone: true,
  template: `
    <div data-test="post-form-stub">
      label: {{ submitLabel }}
      <button type="button" data-test="emit-submit" (click)="submitForm.emit()">
        Emit Submit
      </button>
    </div>
  `
})
export class PostFormStubComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() isSubmitting = false;
  @Input() submitLabel = 'Save';
  @Input() requireDirty = false;

  @Output() submitForm = new EventEmitter<void>();
}
