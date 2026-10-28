
namespace Modul44.Application.DTOs.ResourceDto;

public class ResourceDto
{
	public int Id { get; set; }

	public string Name { get; set; } = string.Empty;

	public string Type { get; set; } = string.Empty;

	public string Sector { get; set; } = string.Empty;

	public bool IsActive { get; set; }
}
