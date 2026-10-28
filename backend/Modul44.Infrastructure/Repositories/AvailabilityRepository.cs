
using Microsoft.EntityFrameworkCore;
using Modul44.Application.Interfaces;
using Modul44.Infrastructure.Data;

namespace Modul44.Infrastructure.Repositories;

public class AvailabilityRepository : IAvailabilityRepository
{
	private readonly AppDbContext _context;

	public AvailabilityRepository(AppDbContext context)
	{
		_context = context;
	}


	public async Task<List<BusyInterval>> GetBusyIntervalsAsync(
		int resourceId,
		DateTime dayStartUtc,
		DateTime dayEndUtc,
		int? excludeAppointmentId = null)
	{
		var appointments = await _context.Appointments
			.AsNoTracking()
			.Where(x =>
				x.Status != "Cancelled" &&
				(!excludeAppointmentId.HasValue ||
				 x.Id != excludeAppointmentId.Value) &&
				x.StartTime < dayEndUtc &&
				x.EndTime > dayStartUtc &&
				(
					x.ResourceId == resourceId ||
					x.AppointmentResources.Any(ar =>
						ar.ResourceId == resourceId)
				))
			.Select(x => new BusyInterval(
				x.StartTime,
				x.EndTime))
			.ToListAsync();

		var unavailabilities =
			await _context.ResourceUnavailabilities
				.AsNoTracking()
				.Where(x =>
					x.ResourceId == resourceId &&
					x.StartTime < dayEndUtc &&
					x.EndTime > dayStartUtc)
				.Select(x => new BusyInterval(
					x.StartTime,
					x.EndTime))
				.ToListAsync();

		return appointments
			.Concat(unavailabilities)
			.OrderBy(x => x.StartTime)
			.ToList();
	}
}
