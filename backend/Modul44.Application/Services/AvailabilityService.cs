
using Modul44.Application.DTOs.AvailabilityDto;
using Modul44.Application.Interfaces;
using Modul44.Domain.Entities;
using ServiceEntity = Modul44.Domain.Entities.Service;

namespace Modul44.Application.Services;

public class AvailabilityService : IAvailabilityService
{
	private readonly IAvailabilityRepository _availabilityRepository;
	private readonly IResourceScheduleRepository _scheduleRepository;
	private readonly IGenericRepository<Resource> _resourceRepository;
	private readonly IGenericRepository<ServiceEntity> _serviceRepository;

	private static readonly TimeZoneInfo BusinessTimeZone =
		TimeZoneInfo.FindSystemTimeZoneById("Europe/Istanbul");

	private const int SlotIntervalMinutes = 15;

	public AvailabilityService(
		IAvailabilityRepository availabilityRepository,
		IResourceScheduleRepository scheduleRepository,
		IGenericRepository<Resource> resourceRepository,
		IGenericRepository<ServiceEntity> serviceRepository)
	{
		_availabilityRepository = availabilityRepository;
		_scheduleRepository = scheduleRepository;
		_resourceRepository = resourceRepository;
		_serviceRepository = serviceRepository;
	}

	public async Task<AvailabilityDto> GetAvailableSlotsAsync(
		int resourceId,
		int serviceId,
		DateOnly date)
	{
		var (resource, service) =
			await GetValidatedEntitiesAsync(resourceId, serviceId);

		var result = new AvailabilityDto
		{
			ResourceId = resourceId,
			ServiceId = serviceId,
			Date = date,
			DurationMinutes = service.DurationMinutes
		};

		if (!resource.IsActive)
			return result;

		var workingHours = await _scheduleRepository
			.GetWorkingHoursAsync(resourceId);

		var dailyHours = workingHours
			.Where(x => x.DayOfWeek == date.DayOfWeek)
			.OrderBy(x => x.StartTime)
			.ToList();

		if (dailyHours.Count == 0)
			return result;

		var dayStartUtc = ConvertToUtc(
			date.ToDateTime(TimeOnly.MinValue));

		var dayEndUtc = ConvertToUtc(
			date.AddDays(1).ToDateTime(TimeOnly.MinValue));

		var busyIntervals = await _availabilityRepository
			.GetBusyIntervalsAsync(
				resourceId,
				dayStartUtc,
				dayEndUtc);

		foreach (var workingHour in dailyHours)
		{
			var windowStart = date.ToDateTime(
				workingHour.StartTime);

			var windowEnd = date.ToDateTime(
				workingHour.EndTime);

			var candidate = windowStart;

			while (candidate.AddMinutes(service.DurationMinutes)
				   <= windowEnd)
			{
				var candidateEnd =
					candidate.AddMinutes(service.DurationMinutes);

				var startUtc = ConvertToUtc(candidate);
				var endUtc = ConvertToUtc(candidateEnd);

				var overlaps = busyIntervals.Any(x =>
					startUtc < x.EndTime &&
					x.StartTime < endUtc);

				if (!overlaps)
				{
					result.AvailableSlots.Add(new AvailableSlotDto
					{
						StartTime = candidate.ToString("HH:mm"),
						EndTime = candidateEnd.ToString("HH:mm"),
						StartUtc = startUtc,
						EndUtc = endUtc
					});
				}

				candidate =
					candidate.AddMinutes(SlotIntervalMinutes);
			}
		}

		result.AvailableSlots = result.AvailableSlots
			.OrderBy(x => x.StartUtc)
			.ToList();

		return result;
	}

	public async Task<bool> IsAvailableAsync(
		int resourceId,
		int serviceId,
		DateTime startUtc,
		DateTime endUtc,
		int? excludeAppointmentId = null)
	{
		if (startUtc.Kind != DateTimeKind.Utc ||
			endUtc.Kind != DateTimeKind.Utc ||
			endUtc <= startUtc)
		{
			return false;
		}

		var (resource, service) =
			await GetValidatedEntitiesAsync(resourceId, serviceId);

		if (!resource.IsActive)
			return false;

		if (endUtc - startUtc !=
			TimeSpan.FromMinutes(service.DurationMinutes))
		{
			return false;
		}

		var localStart = TimeZoneInfo.ConvertTimeFromUtc(
			startUtc, BusinessTimeZone);

		var localEnd = TimeZoneInfo.ConvertTimeFromUtc(
			endUtc, BusinessTimeZone);

		if (localStart.Date != localEnd.Date)
			return false;

		var date = DateOnly.FromDateTime(localStart);

		var workingHours = await _scheduleRepository
			.GetWorkingHoursAsync(resourceId);

		var withinWorkingHours = workingHours.Any(x =>
			x.DayOfWeek == date.DayOfWeek &&
			TimeOnly.FromDateTime(localStart) >= x.StartTime &&
			TimeOnly.FromDateTime(localEnd) <= x.EndTime);

		if (!withinWorkingHours)
			return false;

		var busyIntervals = await _availabilityRepository
		.GetBusyIntervalsAsync(
		resourceId,
		startUtc,
		endUtc,
		excludeAppointmentId);

		return !busyIntervals.Any(x =>
			startUtc < x.EndTime &&
			x.StartTime < endUtc);
	}

	private async Task<(Resource Resource, ServiceEntity Service)>
		GetValidatedEntitiesAsync(int resourceId, int serviceId)
	{
		var resource = await _resourceRepository
			.GetByIdAsync(resourceId);

		if (resource is null)
			throw new ArgumentException("Resource not found.");

		var service = await _serviceRepository
			.GetByIdAsync(serviceId);

		if (service is null)
			throw new ArgumentException("Service not found.");

		if (!string.Equals(
			resource.Sector,
			service.Sector,
			StringComparison.OrdinalIgnoreCase))
		{
			throw new ArgumentException(
				"Resource and service sectors do not match.");
		}

		if (service.DurationMinutes <= 0)
			throw new ArgumentException("Invalid service duration.");

		return (resource, service);
	}

	private static DateTime ConvertToUtc(DateTime localDateTime)
	{
		var unspecified = DateTime.SpecifyKind(
			localDateTime, DateTimeKind.Unspecified);

		return TimeZoneInfo.ConvertTimeToUtc(
			unspecified, BusinessTimeZone);
	}
}
