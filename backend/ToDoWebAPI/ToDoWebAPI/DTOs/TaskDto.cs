namespace ToDoWebAPI.DTOs
{
    public class TaskDto
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public bool IsCompleted { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set;  }
        public string? CreatedAt { get; set; }
        public int UserId { get; set; }
    }
}
