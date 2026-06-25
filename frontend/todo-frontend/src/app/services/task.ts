import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { TaskDto, TaskCreateUpdateDto, PagedResultDto } from '../models/task.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/tasks`; 

  tasks = signal<TaskDto[]>([]);
  totalCount = signal(0);

  categories = signal<any[]>([]);

  getTasks(
    pageNumber = 1, 
    pageSize = 10, 
    searchTerm?: string, 
    enabledCategoryIds?: number[], 
    includeNoCategory = true,
    isCompleted?: boolean | null,
    sortAscending = false
  ): Observable<PagedResultDto<TaskDto>> {
    
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('includeNoCategory', includeNoCategory.toString())
      .set('sortAscending', sortAscending.toString());

    if (searchTerm) params = params.set('searchTerm', searchTerm);
    
    if (isCompleted !== null && isCompleted !== undefined) {
      params = params.set('isCompleted', isCompleted.toString());
    }
    
    if (enabledCategoryIds && enabledCategoryIds.length > 0) {
      enabledCategoryIds.forEach(id => {
        params = params.append('enabledCategoryIds', id.toString());
      });
    }

    return this.http.get<PagedResultDto<TaskDto>>(this.baseUrl, { params, withCredentials: true }).pipe(
      tap(response => {
        this.tasks.set(response.items);
        this.totalCount.set(response.totalCount);
      })
    );
  }

  createTask(taskData: TaskCreateUpdateDto): Observable<TaskDto> {
    return this.http.post<TaskDto>(this.baseUrl, taskData, { withCredentials: true })
  }

  updateTask(id: number, taskData: TaskCreateUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, taskData, { withCredentials: true });
  }
  toggleTaskStatus(id: number, isCompleted: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/status`, isCompleted, { 
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      tap(() => {
        this.tasks.update(currentTasks => 
          currentTasks.map(t => t.id === id ? { ...t, isCompleted } : t)
        );
      })
    );
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/categories`, { withCredentials: true }).pipe(
      tap(categoriesList => {
        this.categories.set(categoriesList);
      })
    );
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true }).pipe(
      tap(() => {
        this.tasks.update(currentTasks => currentTasks.filter(t => t.id !== id));
      })
    );
  }
}