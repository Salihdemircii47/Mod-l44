
using Modul44.Domain.Entities;

namespace Modul44.Application.Interfaces;

public interface IResourceScheduleRepository
{
	Task<List<ResourceWorkingHour>> GetWorkingHoursAsync(
		int resourceId);

	Task<ResourceWorkingHour?> GetWorkingHourByIdAsync(
		int id);

	Task AddWorkingHourAsync(ResourceWorkingHour entity);

	void DeleteWorkingHour(ResourceWorkingHour entity);

	Task<List<ResourceUnavailability>> GetUnavailabilitiesAsync(
		int resourceId);

	Task<ResourceUnavailability?> GetUnavailabilityByIdAsync(
		int id);

	Task AddUnavailabilityAsync(ResourceUnavailability entity);

	void DeleteUnavailability(ResourceUnavailability entity);

	Task<int> SaveChangesAsync();
}
