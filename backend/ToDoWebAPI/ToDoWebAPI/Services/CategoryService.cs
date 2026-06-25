using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ToDoWebAPI.Data;
using ToDoWebAPI.DTOs;

namespace ToDoWebAPI.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CategoryService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
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

        public async Task<IEnumerable<CategoryDto>> GetUserCategoriesAsync()
        {
            var currentUserId = GetCurrentUserId();

            var categories = await _context.Tasks
                .Where(t => t.UserId == currentUserId && t.CategoryId != null)
                .Select(t => t.Category)
                .Distinct()
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name
                })
                .ToListAsync();

            return categories;
        }
    }
}