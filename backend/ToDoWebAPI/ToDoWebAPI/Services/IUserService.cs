using SongSorterWebAPI.Models;
using ToDoWebAPI.Data;
using ToDoWebAPI.Models;

namespace ToDoWebAPI.Services
{
    public interface IUserService
    {
        public Task<bool> IsEmailTakenAsync(string email);
        public Task<bool> IsEmailVerifiedAsync(string email);
        public Task<bool> IsUsernameTakenAsync(string username);
        public Task<int> ContextSaveChangesAsync();
        public void AddNewAppUser(UserEntity newUser);
        public Task<UserEntity?> FindUserViaEmailAsync(string email);
        public Task<UserEntity?> FindUserViaIdAsync(int id);
    }
}
