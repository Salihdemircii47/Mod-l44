
using System.ComponentModel.DataAnnotations;

namespace Modul44.Application.DTOs.MultiResourceAppointmentDto;

public class AssignedResourceDto
{
	[Range(1, int.MaxValue)]
	public int ResourceId { get; set; }

	[Required]
	[MaxLength(50)]
	public string Role { get; set; } = string.Empty;
}

public class AssignedResourceDetailDto
{
	public int ResourceId { get; set; }

	public string ResourceName { get; set; } = string.Empty;

	public string Role { get; set; } = string.Empty;
}
