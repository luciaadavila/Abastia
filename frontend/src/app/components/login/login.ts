import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { LoginForm } from '../../interfaces/auth.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  hide = signal(true);
  clickEvent(event: MouseEvent): void {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  loginForm = new FormGroup<LoginForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
  }
}
