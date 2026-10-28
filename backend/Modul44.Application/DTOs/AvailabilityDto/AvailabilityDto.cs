
namespace Modul44.Application.DTOs.AvailabilityDto
{
	public class AvailabilityDto
	{
		public int ResourceId { get; set; }

		public int ServiceId { get; set; }

		public DateOnly Date { get; set; }

		public int DurationMinutes { get; set; }

		public List<AvailableSlotDto> AvailableSlots { get; set; } = new();
	}
}
