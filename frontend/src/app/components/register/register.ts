import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RegisterForm } from '../../interfaces/auth.interface';

export const passwordMatchValidator = (control: AbstractControl): ValidationErrors | null => {
  const formGroup = control as FormGroup<RegisterForm>;
  const password = formGroup.get('password')?.value;
  const confirmPassword = formGroup.get('confirmPassword')?.value;

  return password !== confirmPassword ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, RouterLink, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  errorMessage = '';
  registerForm = new FormGroup<RegisterForm>(
    {
      username: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3)],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)],
      }),
    },
    { validators: passwordMatchValidator },
  );

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    const formValues = this.registerForm.getRawValue();
    const { confirmPassword, ...registerData } = formValues;
    this.errorMessage = '';

    this.authService.register(registerData).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.registerForm.get('email')?.setErrors({ emailTaken: true });
        } else {
          const backendMessage = err.error?.message;
          this.errorMessage = Array.isArray(backendMessage)
            ? backendMessage.join(', ')
            : (backendMessage ?? 'No se pudo registrar al usuario');
        }
      },
    });
  }
}
