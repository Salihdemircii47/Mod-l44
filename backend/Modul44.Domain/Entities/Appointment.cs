namespace Modul44.Domain.Entities;

public class Appointment
{
	public int Id { get; set; }

	public int CustomerId { get; set; }
	public Customer Customer { get; set; } = null!;

	public int ServiceId { get; set; }
	public Service Service { get; set; } = null!;

	public int ResourceId { get; set; }
	public Resource Resource { get; set; } = null!;

	public DateTime StartTime { get; set; }
	public DateTime EndTime { get; set; }

	public string Status { get; set; } = "Scheduled";

	public string? Notes { get; set; }

	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

	public ICollection<AppointmentResource> AppointmentResources
	{ get; set; } = new List<AppointmentResource>();
}