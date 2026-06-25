using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace ToDoWebAPI.Services
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _config;

        public JwtService(IConfiguration config)
        {
            _config = config;
        }

        public void GenerateAndSetTokenCookie(int userId, HttpContext httpContext, bool rememberMe)
        {
            // 1. Створюємо набір даних які будуть зашифровані в токені
            
            var tokenExpiry = rememberMe ? DateTime.UtcNow.AddDays(30) : DateTime.UtcNow.AddDays(1);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // 2. Дістаємо наш секретний ключ 
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JwtSettings:SecretKey"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // 3. Збираємо сам токен
            var token = new JwtSecurityToken(
                claims: claims,
                expires: tokenExpiry,
                signingCredentials: creds
            );

            // Перетворюємо об'єкт токена на звичайний рядок
            var jwtString = new JwtSecurityTokenHandler().WriteToken(token);

            // 4. ПАКУЄМО В ЗАХИЩЕНУ КУКУ
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true, // Забороняємо доступ до куки з JavaScript
                Secure = true,   // Вимагаємо HTTPS (на localhost працює нормально)
                SameSite = SameSiteMode.Strict, // кука не відправляється з інших сайтів
            };

            if (rememberMe)
            {
                cookieOptions.Expires = DateTime.UtcNow.AddDays(30);
            }

            // Додаємо куку до відповіді сервера. 
            // Назва "jwt_token" має точно співпадати з тією, що ми вказали в Program.cs
            httpContext.Response.Cookies.Append("jwt_token", jwtString, cookieOptions);
        }
    }
}