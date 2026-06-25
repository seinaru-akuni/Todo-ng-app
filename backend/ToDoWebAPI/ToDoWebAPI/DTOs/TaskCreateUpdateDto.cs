namespace ToDoWebAPI.DTOs
{
    public class TaskCreateUpdateDto
    {
        public string Description { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
    }
}
