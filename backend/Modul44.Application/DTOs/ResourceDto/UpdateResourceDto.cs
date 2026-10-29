
using System.ComponentModel.DataAnnotations;

namespace Modul44.Application.DTOs.ResourceDto;

public class UpdateResourceDto
{
	[Required]
	[MaxLength(150)]
	public string Name { get; set; } = string.Empty;

	[Required]
	[MaxLength(50)]
	public string Type { get; set; } = string.Empty;

	[Required]
	[MaxLength(50)]
	public string Sector { get; set; } = string.Empty;

	public bool IsActive { get; set; }
}
