namespace Modul44.Application.DTOs.ResourceWorkingHourDto;

public class ResourceWorkingHourDto
{
	public int Id { get; set; }

	public int ResourceId { get; set; }

	public int DayOfWeek { get; set; }

	public TimeOnly StartTime { get; set; }

	public TimeOnly EndTime { get; set; }
}
