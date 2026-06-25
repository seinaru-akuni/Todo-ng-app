using Microsoft.EntityFrameworkCore;
using SongSorterWebAPI.Models;
using System.Security.Cryptography;
using ToDoWebAPI.Data;
using ToDoWebAPI.Models;

namespace ToDoWebAPI.Services
{
    public class UserService : IUserService
    {
        readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> IsEmailTakenAsync(string email)
        {
            if (await _context.Users.AnyAsync(u => u.Email == email))
                return true;
            else return false;
        }

        public async Task<bool> IsUsernameTakenAsync(string username)
        {
            if (await _context.Users.AnyAsync(u => u.Username == username))
                return true;
            else return false;
        }

        public void AddNewAppUser(UserEntity newUser)
        {
            _context.Users.Add(newUser);
        }

        public async Task<int> ContextSaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public async Task<UserEntity?> FindUserViaEmailAsync(string email)
        {
            return _context.Users.FirstOrDefault(u => u.Email == email);
        }

        public async Task<UserEntity?> FindUserViaIdAsync(int id)
        {
            return _context.Users.FirstOrDefault(u => u.Id == id);
        }
        
        public async Task<bool> IsEmailVerifiedAsync(string email)
        {
            return _context.Users.FirstOrDefault(u => u.Email == email).IsEmailVerified;
        }
    }
}
