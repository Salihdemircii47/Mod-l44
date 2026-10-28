
using Modul44.Application.DTOs.AppointmentDto;

namespace Modul44.Application.Interfaces;

public interface IAppointmentRescheduleService
{
	Task<bool> RescheduleAsync(
		int appointmentId,
		UpdateAppointmentTimeDto dto);
}
