
using Modul44.Application.DTOs;
using Modul44.Application.DTOs.MultiResourceAppointmentDto;

namespace Modul44.Application.Interfaces;

public interface IMultiResourceAppointmentService
{
	Task<MultiResourceAppointmentDto> CreateAsync(
		CreateMultiResourceAppointmentDto dto);

	Task<MultiResourceAppointmentDto?> GetByIdAsync(int id);
}
