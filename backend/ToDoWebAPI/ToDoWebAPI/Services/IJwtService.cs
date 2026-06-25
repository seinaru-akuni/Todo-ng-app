namespace ToDoWebAPI.Services
{
    public interface IJwtService
    {
        // Метод приймає ID користувача та контекст поточного HTTP-запиту (щоб мати доступ до кукі)
        void GenerateAndSetTokenCookie(int userId, HttpContext httpContext, bool rememberMe);
    }
}