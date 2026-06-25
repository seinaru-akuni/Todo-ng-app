using ToDoWebAPI.DTOs;

namespace ToDoWebAPI.Services
{
    public interface ITaskService
    {
        Task<PagedResultDto<TaskDto>> GetTasksAsync(
                int pageNumber,
                int pageSize,
                string? searchTerm,
                List<int>? enabledCategoryIds,
                bool includeNoCategory = true,
                bool? isCompleted = null,
                bool sortAscending = false);        
        Task<TaskDto> GetTaskByIdAsync(int id);
        Task<TaskDto> CreateTaskAsync(TaskCreateUpdateDto taskDto);
        Task UpdateTaskAsync(int id, TaskCreateUpdateDto taskDto);
        Task DeleteTaskAsync(int id);
        Task ToggleTaskStatusAsync(int id, bool isCompleted);
    }
}
