
using Modul44.Application.DTOs.AvailabilityDto;
using Modul44.Application.Interfaces;

namespace Modul44.Application.Services;

public class MultiResourceAvailabilityService
	: IMultiResourceAvailabilityService
{
	private readonly IAvailabilityService _availabilityService;

	public MultiResourceAvailabilityService(
		IAvailabilityService availabilityService)
	{
		_availabilityService = availabilityService;
	}

	public async Task<MultiResourceAvailabilityDto> GetAsync(
		int serviceId,
		DateOnly date,
		List<int> resourceIds)
	{
		if (resourceIds is null || resourceIds.Count == 0)
		{
			throw new ArgumentException(
				"At least one resource is required.");
		}

		var ids = resourceIds.Distinct().ToList();

		if (ids.Count != resourceIds.Count ||
			ids.Any(x => x <= 0) ||
			ids.Count > 20)
		{
			throw new ArgumentException(
				"Provide 1 to 20 unique, positive resource IDs.");
		}

		var results = new List<AvailabilityDto>();

		foreach (var resourceId in ids)
		{
			var result = await _availabilityService
				.GetAvailableSlotsAsync(
					resourceId,
					serviceId,
					date);

			results.Add(result);
		}

		var first = results[0];

		var commonStartTimes = first.AvailableSlots
			.Select(x => x.StartUtc)
			.ToHashSet();

		foreach (var result in results.Skip(1))
		{
			commonStartTimes.IntersectWith(
				result.AvailableSlots.Select(x => x.StartUtc));
		}

		var commonSlots = first.AvailableSlots
			.Where(x => commonStartTimes.Contains(x.StartUtc))
			.OrderBy(x => x.StartUtc)
			.ToList();

		return new MultiResourceAvailabilityDto
		{
			ServiceId = serviceId,
			Date = date,
			DurationMinutes = first.DurationMinutes,
			ResourceIds = ids,
			AvailableSlots = commonSlots
		};
	}
}
