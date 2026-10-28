
namespace Modul44.Application.DTOs.AvailabilityDto;

public class MultiResourceAvailabilityDto
{
	public int ServiceId { get; set; }

	public DateOnly Date { get; set; }

	public int DurationMinutes { get; set; }

	public List<int> ResourceIds { get; set; } = new();

	public List<AvailableSlotDto> AvailableSlots
	{ get; set; } = new();
}
