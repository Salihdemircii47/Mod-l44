
namespace Modul44.Application.DTOs.ServiceDto;

public class ServiceDto
{
	public int Id { get; set; }

	public string Name { get; set; } = string.Empty;

	public string Sector { get; set; } = string.Empty;

	public string? Description { get; set; }

	public int DurationMinutes { get; set; }

	public decimal Price { get; set; }
}
