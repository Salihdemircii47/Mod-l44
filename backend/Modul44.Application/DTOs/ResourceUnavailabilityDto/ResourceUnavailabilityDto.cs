
namespace Modul44.Application.DTOs.ResourceUnavailabilityDto;

public class ResourceUnavailabilityDto
{
	public int Id { get; set; }

	public int ResourceId { get; set; }

	public string Reason { get; set; } = string.Empty;

	public DateTime StartTime { get; set; }

	public DateTime EndTime { get; set; }

	public string? Description { get; set; }
}
