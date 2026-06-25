namespace ToDoWebAPI.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; }

        // Навігаційна властивість (один-до-багатьох)
        public ICollection<TaskEntity> Tasks { get; set; } = new List<TaskEntity>();
    }
}
