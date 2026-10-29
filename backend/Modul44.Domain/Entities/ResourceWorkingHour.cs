
namespace Modul44.Domain.Entities;

public class ResourceWorkingHour
{
	public int Id { get; set; }

	public int ResourceId { get; set; }

	public Resource Resource { get; set; } = null!;

	public DayOfWeek DayOfWeek { get; set; }

	public TimeOnly StartTime { get; set; }

	public TimeOnly EndTime { get; set; }
}
