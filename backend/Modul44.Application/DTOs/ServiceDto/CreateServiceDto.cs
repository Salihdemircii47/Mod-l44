
using System.ComponentModel.DataAnnotations;

namespace Modul44.Application.DTOs.ServiceDto;

public class CreateServiceDto
{
	[Required]
	[MaxLength(150)]
	public string Name { get; set; } = string.Empty;

	[Required]
	[MaxLength(50)]
	public string Sector { get; set; } = string.Empty;

	public string? Description { get; set; }

	[Range(1, 100000)]
	public int DurationMinutes { get; set; }

	[Range(typeof(decimal), "0", "9999999999")]
	public decimal Price { get; set; }
}
