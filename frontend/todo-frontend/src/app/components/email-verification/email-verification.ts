import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './email-verification.html'
})
export class EmailVerificationComponent {
 
  @Input({ required: true }) email!: string; 
  @Input() navigateTo: string = '/';
  @Input() newPassword?: string;
  @Input() confirmNewPassword?: string;

  @Output() cancel = new EventEmitter<void>();

  verificationCode = '';
  message = '';
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.error = '';
    this.message = '';

    this.authService.verifyEmail(this.email, this.verificationCode, this.newPassword, this.confirmNewPassword)
      .subscribe({
        next: () => {
          this.message = 'Успіх! Перенаправляємо...';
          // Після успіху чекаємо 1.5 секунди і перекидаємо на вказаний роут
          setTimeout(() => this.router.navigate([this.navigateTo]), 1500);
        },
        error: (err) => {
          this.error = err.error?.message || err.message || 'Помилка перевірки коду';
        }
      });
  }

  onGoBack(): void {
    this.cancel.emit(); 
  }
}