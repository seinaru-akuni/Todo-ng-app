import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html'
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  public isAuthenticated = this.authService.isAuthenticated;
  public currentUser = this.authService.currentUser;


  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        //після видалення куки переходим на
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Помилка при виході', err);
      }
    });
  }
}