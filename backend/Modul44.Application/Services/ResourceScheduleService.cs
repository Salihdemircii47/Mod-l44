
using Modul44.Application.DTOs.ResourceUnavailabilityDto;
using Modul44.Application.DTOs.ResourceWorkingHourDto;
using Modul44.Application.Interfaces;
using Modul44.Domain.Entities;

namespace Modul44.Application.Services;

public class ResourceScheduleService : IResourceScheduleService
{
	private readonly IResourceScheduleRepository _scheduleRepository;
	private readonly IGenericRepository<Resource> _resourceRepository;

	public ResourceScheduleService(
		IResourceScheduleRepository scheduleRepository,
		IGenericRepository<Resource> resourceRepository)
	{
		_scheduleRepository = scheduleRepository;
		_resourceRepository = resourceRepository;
	}

	public async Task<List<ResourceWorkingHourDto>>
		GetWorkingHoursAsync(int resourceId)
	{
		await EnsureResourceExistsAsync(resourceId);

		var hours = await _scheduleRepository
			.GetWorkingHoursAsync(resourceId);

		return hours.Select(x => new ResourceWorkingHourDto
		{
			Id = x.Id,
			ResourceId = x.ResourceId,
			DayOfWeek = (int)x.DayOfWeek,
			StartTime = x.StartTime,
			EndTime = x.EndTime
		}).ToList();
	}

	public async Task<ResourceWorkingHourDto> AddWorkingHourAsync(
		CreateResourceWorkingHourDto dto)
	{
		await EnsureResourceExistsAsync(dto.ResourceId);

		if (dto.DayOfWeek < 0 || dto.DayOfWeek > 6)
		{
			throw new ArgumentException("Invalid day of week.");
		}

		if (dto.StartTime >= dto.EndTime)
		{
			throw new ArgumentException(
				"End time must be after start time.");
		}

		var existingHours = await _scheduleRepository
			.GetWorkingHoursAsync(dto.ResourceId);

		var hasConflict = existingHours.Any(x =>
			(int)x.DayOfWeek == dto.DayOfWeek &&
			x.StartTime < dto.EndTime &&
			dto.StartTime < x.EndTime);

		if (hasConflict)
		{
			throw new InvalidOperationException(
				"Working hours overlap with an existing interval.");
		}

		var entity = new ResourceWorkingHour
		{
			ResourceId = dto.ResourceId,
			DayOfWeek = (DayOfWeek)dto.DayOfWeek,
			StartTime = dto.StartTime,
			EndTime = dto.EndTime
		};

		await _scheduleRepository.AddWorkingHourAsync(entity);
		await _scheduleRepository.SaveChangesAsync();

		return new ResourceWorkingHourDto
		{
			Id = entity.Id,
			ResourceId = entity.ResourceId,
			DayOfWeek = (int)entity.DayOfWeek,
			StartTime = entity.StartTime,
			EndTime = entity.EndTime
		};
	}

	public async Task<bool> DeleteWorkingHourAsync(int id)
	{
		var entity = await _scheduleRepository
			.GetWorkingHourByIdAsync(id);

		if (entity is null)
			return false;

		_scheduleRepository.DeleteWorkingHour(entity);
		await _scheduleRepository.SaveChangesAsync();

		return true;
	}

	public async Task<List<ResourceUnavailabilityDto>>
		GetUnavailabilitiesAsync(int resourceId)
	{
		await EnsureResourceExistsAsync(resourceId);

		var items = await _scheduleRepository
			.GetUnavailabilitiesAsync(resourceId);

		return items.Select(x => new ResourceUnavailabilityDto
		{
			Id = x.Id,
			ResourceId = x.ResourceId,
			Reason = x.Reason,
			StartTime = x.StartTime,
			EndTime = x.EndTime,
			Description = x.Description
		}).ToList();
	}

	public async Task<ResourceUnavailabilityDto>
		AddUnavailabilityAsync(CreateResourceUnavailabilityDto dto)
	{
		await EnsureResourceExistsAsync(dto.ResourceId);

		if (string.IsNullOrWhiteSpace(dto.Reason))
		{
			throw new ArgumentException("Reason is required.");
		}

		if (dto.StartTime.Kind != DateTimeKind.Utc ||
			dto.EndTime.Kind != DateTimeKind.Utc)
		{
			throw new ArgumentException(
				"StartTime and EndTime must be UTC.");
		}

		if (dto.StartTime >= dto.EndTime)
		{
			throw new ArgumentException(
				"End time must be after start time.");
		}

		var entity = new ResourceUnavailability
		{
			ResourceId = dto.ResourceId,
			Reason = dto.Reason.Trim(),
			StartTime = dto.StartTime,
			EndTime = dto.EndTime,
			Description = dto.Description
		};

		await _scheduleRepository.AddUnavailabilityAsync(entity);
		await _scheduleRepository.SaveChangesAsync();

		return new ResourceUnavailabilityDto
		{
			Id = entity.Id,
			ResourceId = entity.ResourceId,
			Reason = entity.Reason,
			StartTime = entity.StartTime,
			EndTime = entity.EndTime,
			Description = entity.Description
		};
	}

	public async Task<bool> DeleteUnavailabilityAsync(int id)
	{
		var entity = await _scheduleRepository
			.GetUnavailabilityByIdAsync(id);

		if (entity is null)
			return false;

		_scheduleRepository.DeleteUnavailability(entity);
		await _scheduleRepository.SaveChangesAsync();

		return true;
	}

	private async Task EnsureResourceExistsAsync(int resourceId)
	{
		var resource = await _resourceRepository
			.GetByIdAsync(resourceId);

		if (resource is null)
		{
			throw new ArgumentException("Resource not found.");
		}
	}
}
