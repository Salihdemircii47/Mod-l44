
using Microsoft.EntityFrameworkCore;
using Modul44.Application.Interfaces;
using Modul44.Domain.Entities;
using Modul44.Infrastructure.Data;

namespace Modul44.Infrastructure.Repositories;

public class ResourceScheduleRepository
	: IResourceScheduleRepository
{
	private readonly AppDbContext _context;

	public ResourceScheduleRepository(AppDbContext context)
	{
		_context = context;
	}

	public async Task<List<ResourceWorkingHour>>
		GetWorkingHoursAsync(int resourceId)
	{
		return await _context.ResourceWorkingHours
			.AsNoTracking()
			.Where(x => x.ResourceId == resourceId)
			.OrderBy(x => x.DayOfWeek)
			.ThenBy(x => x.StartTime)
			.ToListAsync();
	}

	public async Task<ResourceWorkingHour?>
		GetWorkingHourByIdAsync(int id)
	{
		return await _context.ResourceWorkingHours
			.FindAsync(id);
	}

	public async Task AddWorkingHourAsync(
		ResourceWorkingHour entity)
	{
		await _context.ResourceWorkingHours.AddAsync(entity);
	}

	public void DeleteWorkingHour(ResourceWorkingHour entity)
	{
		_context.ResourceWorkingHours.Remove(entity);
	}

	public async Task<List<ResourceUnavailability>>
		GetUnavailabilitiesAsync(int resourceId)
	{
		return await _context.ResourceUnavailabilities
			.AsNoTracking()
			.Where(x => x.ResourceId == resourceId)
			.OrderBy(x => x.StartTime)
			.ToListAsync();
	}

	public async Task<ResourceUnavailability?>
		GetUnavailabilityByIdAsync(int id)
	{
		return await _context.ResourceUnavailabilities
			.FindAsync(id);
	}

	public async Task AddUnavailabilityAsync(
		ResourceUnavailability entity)
	{
		await _context.ResourceUnavailabilities.AddAsync(entity);
	}

	public void DeleteUnavailability(
		ResourceUnavailability entity)
	{
		_context.ResourceUnavailabilities.Remove(entity);
	}

	public async Task<int> SaveChangesAsync()
	{
		return await _context.SaveChangesAsync();
	}
}
