
using Modul44.Application.DTOs.AvailabilityDto;

namespace Modul44.Application.Interfaces;

public interface IAvailabilityService
{
	Task<AvailabilityDto> GetAvailableSlotsAsync(
		int resourceId,
		int serviceId,
		DateOnly date);

	Task<bool> IsAvailableAsync(
		int resourceId,
		int serviceId,
		DateTime startUtc,
		DateTime endUtc,
		int? excludeAppointmentId = null);
}
