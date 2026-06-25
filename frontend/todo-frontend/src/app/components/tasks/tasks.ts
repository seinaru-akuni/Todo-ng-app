import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TaskService } from '../../services/task';
import { AuthService } from '../../services/auth';
import { TaskCreateUpdateDto } from '../../models/task.model';

@Component({
  selector: 'app-tasks',  
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './tasks.html'
})
export class TasksComponent implements OnInit {
  public taskService = inject(TaskService);
  public authService = inject(AuthService);

  newDescription = '';
  newCategoryName = '';

  // 1. Змінні для текстового пошуку
  searchInput = '';
  appliedSearchQuery = signal('');

  // 2. Сигнали для статусу та сортування
  statusFilter = signal<boolean | null>(null); 
  sortAscending = signal(false); 

  isLoading = signal(false);
  error = signal('');

  // ПАГІНАЦІЯ
  currentPage = signal(1);
  pageSize = signal(5);

  // СИГНАЛИ ФІЛЬТРАЦІЇ
  disabledCategoryIds = signal<number[]>([]);
  isNoCategoryEnabled = signal(true);

  editingTaskId = signal<number | null>(null);
  editDescription = '';
  editCategoryName = '';

  constructor() {
    // Ефект 1: Завантажує таски (реагує на сторінку, фільтри та авторизацію)
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.loadTasks();
      }
    });

    // Ефект 2: Завантажує категорії (реагує ТІЛЬКИ на авторизацію)
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.taskService.getCategories().subscribe();
      }
    });

    effect(() => {
      // відслідковуєм statusFilter, sortAscending, appliedSearchQuery
      if (this.authService.isAuthenticated()) {

        this.statusFilter();
        this.sortAscending();
        this.appliedSearchQuery();
        
        this.loadTasks();
      }
    });
  }

  

  ngOnInit(): void {
  
  }

  loadTasks(): void {
    const allCategories = this.taskService.categories();
    const disabledIds = this.disabledCategoryIds();
    const enabledCategoryIds = allCategories.map(c => c.id).filter(id => !disabledIds.includes(id));

    this.taskService.getTasks(
      this.currentPage(), 
      this.pageSize(), 
      this.appliedSearchQuery(),
      enabledCategoryIds, 
      this.isNoCategoryEnabled(),
      this.statusFilter(),       
      this.sortAscending()      
    ).subscribe({
      error: (err) => {
        if (err.status === 401 || err.status === 403) this.taskService.tasks.set([]);
        this.error.set('Помилка завантаження завдань.');
      }
    });
  }

  applySearch(): void {
    this.appliedSearchQuery.set(this.searchInput.trim());
    this.currentPage.set(1); 
  }

  setStatusFilter(status: boolean | null): void {
    this.statusFilter.set(status);
    this.currentPage.set(1);
  }

  toggleSort(): void {
    this.sortAscending.update(val => !val);
    this.currentPage.set(1);
  }

  // МЕТОДИ КЛІКУ ПО КНОПКАХ ФІЛЬТРІВ
  toggleCategoryFilter(id: number): void {
    this.disabledCategoryIds.update(ids => {
      if (ids.includes(id)) {
        return ids.filter(item => item !== id); // Вмикаємо 
      } else {
        return [...ids, id]; // Вимикаємо 
      }
    });
    this.currentPage.set(1); // При зміні фільтра скидаємо на 1 сторінку
  }

  toggleNoCategoryFilter(): void {
    this.isNoCategoryEnabled.update(state => !state);
    this.currentPage.set(1); 
  }

  // підсвічування активних кнопок
  isCategorySelected(id: number): boolean {
    return !this.disabledCategoryIds().includes(id);
  }

  // ПАГІНАЦІЯ
  nextPage(): void {
    if (this.hasMoreTasks()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  hasMoreTasks(): boolean {
    const totalLoadedExpected = this.currentPage() * this.pageSize();
    return this.taskService.totalCount() > totalLoadedExpected;
  }

  totalPages(): number {
    return Math.ceil(this.taskService.totalCount() / this.pageSize()) || 1;
  }

  // СТВОРЕННЯ, ОНОВЛЕННЯ ТА ВИДАЛЕННЯ
  onCreateTask(): void {
    if (!this.newDescription.trim()) return;

    this.isLoading.set(true);
    this.error.set('');

    const payload: TaskCreateUpdateDto = {
      description: this.newDescription,
      categoryId: null,
      categoryName: this.newCategoryName.trim() || null 
    };

    this.taskService.createTask(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.newDescription = '';
        this.newCategoryName = '';
        
        // Після створення оновлюємо категорії (раптом створилася нова)
        this.taskService.getCategories().subscribe();

        if (this.currentPage() === 1) {
          this.loadTasks();
        } else {
          this.currentPage.set(1);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Не вдалося створити завдання.');
      }
    });
  }

  onToggleStatus(id: number, currentStatus: boolean): void {
    this.taskService.toggleTaskStatus(id, !currentStatus).subscribe({
      error: () => this.error.set('Не вдалося оновити статус завдання.')
    });
  }

  onDeleteTask(id: number): void {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.loadTasks(); 
      },
      error: () => this.error.set('Не вдалося видалити завдання.')
    });
  }

  startEdit(task: any): void {
    this.editingTaskId.set(task.id);
    this.editDescription = task.description;
    // Якщо категорія є, підставляємо її назву
    this.editCategoryName = task.categoryName && task.categoryName !== 'Без категорії' ? task.categoryName : '';
  }

  // Скасувати редагування
  cancelEdit(): void {
    this.editingTaskId.set(null);
    this.editDescription = '';
    this.editCategoryName = '';
  }

  // Зберегти зміни
  saveEdit(id: number): void {
    if (!this.editDescription.trim()) return;

    this.isLoading.set(true);

    const payload: TaskCreateUpdateDto = {
      description: this.editDescription.trim(),
      categoryId: null, 
      categoryName: this.editCategoryName.trim() || null 
    };

    this.taskService.updateTask(id, payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.cancelEdit(); // Закриваємо форму
        
        this.taskService.getCategories().subscribe();
        this.loadTasks(); 
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Не вдалося оновити завдання.');
      }
    });
  }
}