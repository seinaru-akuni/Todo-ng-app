using Microsoft.AspNetCore.Authorization; // ОБОВ'ЯЗКОВО ДОДАЙТЕ ЦЕЙ USING
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using ToDoWebAPI.DTOs;
using ToDoWebAPI.Services;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;
    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    // GET: api/tasks?pageNumber=1&pageSize=10&searchTerm=work&categoryId=2
    [HttpGet]
    public async Task<ActionResult<PagedResultDto<TaskDto>>> GetAll(
    [FromQuery] int pageNumber = 1,
    [FromQuery] int pageSize = 10,
    [FromQuery] string? searchTerm = null,
    [FromQuery] List<int>? enabledCategoryIds = null,
    [FromQuery] bool includeNoCategory = true,
    [FromQuery] bool? isCompleted = null, // Додали
    [FromQuery] bool sortAscending = false) // Додали
    {
        var result = await _taskService.GetTasksAsync(pageNumber, pageSize, searchTerm, enabledCategoryIds, includeNoCategory, isCompleted, sortAscending);
        return Ok(result);
    }

    // GET: api/tasks/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TaskDto>> GetById(int id)
    {
        var task = await _taskService.GetTaskByIdAsync(id);
        if (task == null)
            return NotFound(new { message = "Таску не знайдено" });

        return Ok(task);
    }

    // POST: api/tasks
    [HttpPost]
    public async Task<ActionResult<TaskDto>> Create([FromBody] TaskCreateUpdateDto taskDto)
    {
        var createdTask = await _taskService.CreateTaskAsync(taskDto);
        return CreatedAtAction(nameof(GetById), new { id = createdTask.Id }, createdTask);
    }

    // PUT: api/tasks/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] TaskCreateUpdateDto taskDto)
    {
        await _taskService.UpdateTaskAsync(id, taskDto);
        return NoContent(); 
    }

    // PATCH: api/tasks/5/status
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> ToggleStatus(int id, [FromBody] bool isCompleted)
    {
        await _taskService.ToggleTaskStatusAsync(id, isCompleted);
        return NoContent();
    }

    // DELETE: api/tasks/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _taskService.DeleteTaskAsync(id);
        return NoContent();
    }
}