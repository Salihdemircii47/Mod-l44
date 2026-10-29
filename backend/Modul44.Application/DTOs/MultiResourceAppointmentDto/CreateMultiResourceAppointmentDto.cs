
using System.ComponentModel.DataAnnotations;

namespace Modul44.Application.DTOs.MultiResourceAppointmentDto;

public class CreateMultiResourceAppointmentDto
{
	[Range(1, int.MaxValue)]
	public int CustomerId { get; set; }

	[Range(1, int.MaxValue)]
	public int ServiceId { get; set; }

	[Required]
	public DateTime StartTime { get; set; }

	[Required]
	public DateTime EndTime { get; set; }

	public string? Notes { get; set; }

	[Required]
	[MinLength(1)]
	public List<AssignedResourceDto> Resources { get; set; } = new();
}
