using ToDoWebAPI.DTOs;

namespace ToDoWebAPI.Services
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetUserCategoriesAsync();
    }
}