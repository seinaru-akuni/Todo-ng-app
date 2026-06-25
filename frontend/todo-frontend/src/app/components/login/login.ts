import { Component, signal } from '@angular/core'; // Має бути signal!
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html'
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;
  
  message = signal('');
  error = signal('');
  isLoading = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.message.set('');
    this.error.set('');
    this.isLoading.set(true);

    this.authService.login({ email: this.email, password: this.password, rememberMe: this.rememberMe })
      .subscribe({
        next: (result: any) => {
          this.isLoading.set(false);
          this.message.set(result?.message || 'Вхід успішний! Перенаправляємо...');
          setTimeout(() => this.router.navigate(['/tasks']), 1000);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.error.set(err.error?.message || err.message || 'Помилка авторизації');
        }
      });
  }

  onCheckMe(): void {
    this.authService.getMe().subscribe({
      next: (user: any) => {
        alert(`Сервер бачить вас! ID: ${user.id}, Email: ${user.email}`);
      },
      error: () => {
        alert('Сервер вас не впізнав');
      }
    });
  }

  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}