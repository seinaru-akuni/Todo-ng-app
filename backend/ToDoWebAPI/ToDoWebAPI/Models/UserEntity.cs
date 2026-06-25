namespace SongSorterWebAPI.Models
{
    public class UserEntity
    {
        public int Id { get; set; }
        public string Username {  get; set; }
        public required string Email { get; set; }
        public string? PasswordHash { get; set; }
        public bool IsEmailVerified { get; set; } = false;
        public string? VerificationCode { get; set; }
        public DateTime? VerificationCodeExpiry { get; set; }    
    }
}
