import { Component, signal, OnInit, inject } from '@angular/core'; // Додали inject
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router'; // Додали Router та ActivatedRoute
import { AuthService } from '../../services/auth';
import { EmailVerificationComponent } from '../email-verification/email-verification'; 

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EmailVerificationComponent],
  templateUrl: './forgot-password.html'
})
export class ForgotPasswordComponent implements OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  
  email = '';
  password = '';
  confirmPassword = '';

  isAwaitingCode = signal(false);
  isLoading = signal(false);
  message = signal('');
  error = signal('');

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.isAwaitingCode.set(params['step'] === 'verify');
      
      this.isLoading.set(false);
      this.message.set('');
      this.error.set('');
    });
  }

  onSubmit(): void {
    this.message.set('');
    this.error.set('');

    if (this.password !== this.confirmPassword) {
      this.error.set('Паролі не співпадають.');
      return;
    }

    this.isLoading.set(true);

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.message.set('Код відправлено на вашу пошту!');
      
        this.router.navigate([], { queryParams: { step: 'verify' } });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || err.message || 'Помилка відновлення паролю');
      }
    });
  }

  resetFields(): void {
    this.isAwaitingCode.set(false);
  }
}