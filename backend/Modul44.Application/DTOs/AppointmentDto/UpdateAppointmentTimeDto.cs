
using System.ComponentModel.DataAnnotations;

namespace Modul44.Application.DTOs.AppointmentDto;

public class UpdateAppointmentTimeDto
{
	[Required]
	public DateTime StartTime { get; set; }

	[Required]
	public DateTime EndTime { get; set; }
}
