
namespace Modul44.Application.DTOs.MultiResourceAppointmentDto;

public class MultiResourceAppointmentDto
{
	public int Id { get; set; }

	public int CustomerId { get; set; }

	public int ServiceId { get; set; }

	public DateTime StartTime { get; set; }

	public DateTime EndTime { get; set; }

	public string Status { get; set; } = string.Empty;

	public string? Notes { get; set; }

	public List<AssignedResourceDetailDto> Resources
	{ get; set; } = new();
}
