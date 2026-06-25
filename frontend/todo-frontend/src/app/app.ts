import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./components/header/header";
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Без цього викликупісля F5 нічого не знає про куку
    this.authService.checkAuth().subscribe({
      next: (user) => console.log('Сесію відновлено:', user),
      error: (err) => console.log('Гість або помилка:', err)
    });
  }
}