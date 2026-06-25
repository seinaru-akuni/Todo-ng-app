import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { EmailVerificationComponent } from '../email-verification/email-verification';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EmailVerificationComponent],
  templateUrl: './register.html'
})
export class RegisterComponent {
  email = '';
  username = '';
  password = '';
  confirmPassword = '';

  isAwaitingCode = signal(false);
  isLoading = signal(false);
  message = signal('');
  error = signal('');
  

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    this.message.set('');
    this.error.set('');

    if (this.password !== this.confirmPassword) {
      this.error.set('Паролі не співпадають.');
      return;
    }

    this.authService.register({ 
      email: this.email, 
      username: this.username, 
      password: this.password, 
      confirmPassword: this.confirmPassword 
    }).subscribe({
      next: () => {
        this.isAwaitingCode.set(true);
        this.message.set('Код відправлено на вашу пошту!');
      },
      error: (err) => {
        this.error = err.error?.message || err.message || 'Помилка реєстрації';
      }
    });
  }

  resetFields(): void {
    this.isAwaitingCode.set(false);
  }

  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}