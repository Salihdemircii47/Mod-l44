
using Modul44.Application.DTOs.AppointmentDto;

namespace Modul44.Application.Interfaces;

public interface IAppointmentService
{
	Task<List<AppointmentDto>> GetAllAsync();

	Task<AppointmentDto?> GetByIdAsync(int id);

	Task<AppointmentDto> CreateAsync(
		CreateAppointmentDto dto);

	Task<bool> CancelAsync(int id);
}
