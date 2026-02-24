import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Router, ActivatedRoute  } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  get f() { return this.form.controls; }

  submit(): void {
    if(this.form.invalid) return;

    this.auth.login({
      email: this.form.value.email!,
      password: this.form.value.password!
    }).subscribe({
      next: (res) => {
        this.auth.handleLoginSuccess(res);
        this.toast.showSuccess('Logged in');
        //this.router.navigate(['/post/index']);
        const returnUrl: string = this.route.snapshot.queryParams['returnUrl'] || '/post/index';
        this.router.navigateByUrl(returnUrl);
          
      },
      error: () => {
        // Keep it simple for mock auth
        this.toast.showError('Login failed');
      }
    });
  }
}
