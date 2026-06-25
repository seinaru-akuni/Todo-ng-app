using SongSorterWebAPI.Models;

namespace ToDoWebAPI.Models
{
    public class TaskEntity
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public bool IsCompleted { get; set; }

        // Зв'язок із категорією (робимо nullable, бо таска може бути без категорії)
        public int? CategoryId { get; set; }
        public Category? Category { get; set; }
        public int UserId { get; set; }
        public UserEntity User { get; set; }
    }
}
