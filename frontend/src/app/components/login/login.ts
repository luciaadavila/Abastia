import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginForm } from '../../interfaces/auth.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    RouterLink,
    CommonModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  errorMessage = '';
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
      validators: [Validators.required],
    }),
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.errorMessage = '';

    const loginData = this.loginForm.getRawValue();
    this.authService.login(loginData).subscribe({
      next: (response: any) => {
        console.log('Login exitoso. Respuesta del servidor:', response);

        localStorage.setItem('token', response.access_token);

        this.router.navigate(['/home']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error del backend al iniciar sesión:', err);

        if (err.status === 401) {
          this.loginForm.get('password')?.setErrors({ invalidCredentials: true });
        } else {
          const backendMessage = err.error?.message;
          this.errorMessage = Array.isArray(backendMessage)
            ? backendMessage.join(', ')
            : (backendMessage ?? 'No se pudo iniciar sesión. Verifica tus datos.');
        }
      },
    });
  }
}
