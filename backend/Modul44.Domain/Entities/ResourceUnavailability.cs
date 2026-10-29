
namespace Modul44.Domain.Entities;

public class ResourceUnavailability
{
	public int Id { get; set; }

	public int ResourceId { get; set; }

	public Resource Resource { get; set; } = null!;

	public string Reason { get; set; } = string.Empty;

	public DateTime StartTime { get; set; }

	public DateTime EndTime { get; set; }

	public string? Description { get; set; }

	public DateTime CreatedAt { get; set; }
		= DateTime.UtcNow;
}
