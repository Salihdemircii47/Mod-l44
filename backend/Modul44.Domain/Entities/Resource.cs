namespace Modul44.Domain.Entities;

public class Resource
{
	public int Id { get; set; }

	public string Name { get; set; } = string.Empty;

	public string Type { get; set; } = string.Empty;

	public string Sector { get; set; } = string.Empty;

	public bool IsActive { get; set; } = true;

	public ICollection<Appointment> Appointments { get; set; }
		= new List<Appointment>();

	public ICollection<AppointmentResource> AppointmentResources
	{ get; set; } = new List<AppointmentResource>();
}