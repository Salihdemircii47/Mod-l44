
namespace Modul44.Domain.Entities;

public class AppointmentResource
{
	public int Id { get; set; }

	public int AppointmentId { get; set; }

	public Appointment Appointment { get; set; } = null!;

	public int ResourceId { get; set; }

	public Resource Resource { get; set; } = null!;

	public string Role { get; set; } = string.Empty;
}
