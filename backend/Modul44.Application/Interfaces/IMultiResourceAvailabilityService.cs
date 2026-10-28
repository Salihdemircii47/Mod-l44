
using Modul44.Application.DTOs.AvailabilityDto;

namespace Modul44.Application.Interfaces;

public interface IMultiResourceAvailabilityService
{
	Task<MultiResourceAvailabilityDto> GetAsync(
		int serviceId,
		DateOnly date,
		List<int> resourceIds);
}
