using Microsoft.EntityFrameworkCore;
using ToDoWebAPI.Data;
using ToDoWebAPI.DTOs;
using ToDoWebAPI.Models;
using System.Security.Claims;

namespace ToDoWebAPI.Services
{
    public class TaskService : ITaskService
    {


        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public TaskService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                throw new UnauthorizedAccessException("Користувач не авторизований.");
            }

            return int.Parse(userIdClaim);
        }

        public async Task<PagedResultDto<TaskDto>> GetTasksAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm,
        List<int>? enabledCategoryIds,
        bool includeNoCategory = true,
        bool? isCompleted = null,
        bool sortAscending = false)
        {
            var currentUserId = GetCurrentUserId();
            var query = _context.Tasks.Where(t => t.UserId == currentUserId);

            // 1. Фільтрація категорій
            if (enabledCategoryIds != null && enabledCategoryIds.Any())
            {
                if (includeNoCategory)
                    query = query.Where(t => t.CategoryId == null || enabledCategoryIds.Contains(t.CategoryId.Value));
                else
                    query = query.Where(t => t.CategoryId != null && enabledCategoryIds.Contains(t.CategoryId.Value));
            }
            else if (!includeNoCategory)
            {
                query = query.Where(t => t.CategoryId != null);
            }

            // 2. Фільтр за статусом (виконано / не виконано)
            if (isCompleted.HasValue)
            {
                query = query.Where(t => t.IsCompleted == isCompleted.Value);
            }

            // 3. Пошук по опису АБО назві категорії
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(t =>
                    t.Description.Contains(searchTerm) ||
                    (t.Category != null && t.Category.Name.Contains(searchTerm)));
            }

            var totalCount = await query.CountAsync();

            // 4. Сортування
            if (sortAscending)
            {
                query = query.OrderBy(t => t.Id); // Старі спочатку (ID зростає)
            }
            else
            {
                query = query.OrderByDescending(t => t.Id); // Нові спочатку
            }

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new TaskDto
                {
                    Id = t.Id,
                    Description = t.Description,
                    IsCompleted = t.IsCompleted,
                    CategoryId = t.CategoryId,
                    CategoryName = _context.Categories
                        .Where(c => c.Id == t.CategoryId)
                        .Select(c => c.Name)
                        .FirstOrDefault() ?? "Без категорії"
                })
                .ToListAsync();

            return new PagedResultDto<TaskDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<TaskDto> GetTaskByIdAsync(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return null;

            var categoryName = await _context.Categories
                .Where(c => c.Id == task.CategoryId)
                .Select(c => c.Name)
                .FirstOrDefaultAsync();

            return new TaskDto
            {
                Id = task.Id,
                Description = task.Description,
                IsCompleted = task.IsCompleted,
                CategoryId = task.CategoryId,
                CategoryName = categoryName ?? "Без категорії"
            };
        }

        public async Task<TaskDto> CreateTaskAsync(TaskCreateUpdateDto taskDto)
        {
            var currentUserId = GetCurrentUserId();
            var finalCategoryId = await GetOrCreateCategoryIdAsync(taskDto.CategoryId, taskDto.CategoryName);

            var entity = new TaskEntity
            {
                Description = taskDto.Description,
                IsCompleted = false,
                CategoryId = finalCategoryId,
                UserId = currentUserId
            };

            _context.Tasks.Add(entity);
            await _context.SaveChangesAsync();

            return await GetTaskByIdAsync(entity.Id);
        }

        public async Task UpdateTaskAsync(int id, TaskCreateUpdateDto taskDto)
        {
            var entity = await _context.Tasks.FindAsync(id);
            if (entity == null) throw new KeyNotFoundException("Таску не знайдено");

            entity.CategoryId = await GetOrCreateCategoryIdAsync(taskDto.CategoryId, taskDto.CategoryName);
            entity.Description = taskDto.Description;

            await _context.SaveChangesAsync();
        }

        public async Task ToggleTaskStatusAsync(int id, bool isCompleted)
        {
            var entity = await _context.Tasks.FindAsync(id);

            if (entity == null)
                throw new KeyNotFoundException("Таску не знайдено");

            entity.IsCompleted = isCompleted;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteTaskAsync(int id)
        {
            var currentUserId = GetCurrentUserId();

            // Шукаємо таску яка має цей ID І належить юзеру
            var entity = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == currentUserId);

            if (entity != null)
            {
                _context.Tasks.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }

        private async Task<int?> GetOrCreateCategoryIdAsync(int? providedId, string? categoryName)
        {
            if (string.IsNullOrWhiteSpace(categoryName))
                return providedId;

            var existingCategory = await _context.Categories
                .FirstOrDefaultAsync(c => c.Name.ToLower() == categoryName.ToLower());

            if (existingCategory != null)
                return existingCategory.Id;

            var newCategory = new Category { Name = categoryName };
            _context.Categories.Add(newCategory);
            await _context.SaveChangesAsync();

            return newCategory.Id;
        }
    }

}

