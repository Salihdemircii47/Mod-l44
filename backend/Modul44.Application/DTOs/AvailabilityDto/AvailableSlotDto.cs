
namespace Modul44.Application.DTOs.AvailabilityDto
{
	public class AvailableSlotDto
	{
		public string StartTime { get; set; } = string.Empty;

		public string EndTime { get; set; } = string.Empty;

		public DateTime StartUtc { get; set; }

		public DateTime EndUtc { get; set; }
	}
}
