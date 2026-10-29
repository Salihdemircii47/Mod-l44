
using Modul44.Application.DTOs.ResourceUnavailabilityDto;
using Modul44.Application.DTOs.ResourceWorkingHourDto;

namespace Modul44.Application.Interfaces;

public interface IResourceScheduleService
{
	Task<List<ResourceWorkingHourDto>> GetWorkingHoursAsync(
		int resourceId);

	Task<ResourceWorkingHourDto> AddWorkingHourAsync(
		CreateResourceWorkingHourDto dto);

	Task<bool> DeleteWorkingHourAsync(int id);

	Task<List<ResourceUnavailabilityDto>>
		GetUnavailabilitiesAsync(int resourceId);

	Task<ResourceUnavailabilityDto> AddUnavailabilityAsync(
		CreateResourceUnavailabilityDto dto);

	Task<bool> DeleteUnavailabilityAsync(int id);
}
