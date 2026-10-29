
using System.ComponentModel.DataAnnotations;

namespace Modul44.Application.DTOs.ResourceUnavailabilityDto;

public class CreateResourceUnavailabilityDto
{
	[Range(1, int.MaxValue)]
	public int ResourceId { get; set; }

	[Required]
	[MaxLength(50)]
	public string Reason { get; set; } = string.Empty;

	public DateTime StartTime { get; set; }

	public DateTime EndTime { get; set; }

	[MaxLength(500)]
	public string? Description { get; set; }
}
