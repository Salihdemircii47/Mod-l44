
namespace Modul44.Application.DTOs.AppointmentDto
{
	public class AppointmentDto
	{
		public int Id { get; set; }

		public int CustomerId { get; set; }
		public string CustomerName { get; set; } = string.Empty;

		public int ServiceId { get; set; }
		public string ServiceName { get; set; } = string.Empty;

		public int ResourceId { get; set; }
		public string ResourceName { get; set; } = string.Empty;

		public DateTime StartTime { get; set; }
		public DateTime EndTime { get; set; }

		public string Status { get; set; } = string.Empty;

		public string? Notes { get; set; }
	}
}