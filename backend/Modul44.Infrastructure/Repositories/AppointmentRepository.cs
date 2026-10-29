
using Microsoft.EntityFrameworkCore;
using Modul44.Application.Interfaces;
using Modul44.Domain.Entities;
using Modul44.Infrastructure.Data;

namespace Modul44.Infrastructure.Repositories;

public class AppointmentRepository
	: GenericRepository<Appointment>, IAppointmentRepository
{
	public AppointmentRepository(AppDbContext context)
		: base(context)
	{
	}

	public async Task<List<Appointment>> GetWithDetailsAsync()
	{
		return await _context.Appointments
			.AsNoTracking()
			.Include(x => x.Customer)
			.Include(x => x.Service)
			.Include(x => x.Resource)
			.OrderBy(x => x.StartTime)
			.ToListAsync();
	}

	public async Task<Appointment?> GetWithDetailsByIdAsync(int id)
	{
		return await _context.Appointments
			.AsNoTracking()
			.Include(x => x.Customer)
			.Include(x => x.Service)
			.Include(x => x.Resource)
			.FirstOrDefaultAsync(x => x.Id == id);
	}

	public async Task<bool> HasConflictAsync(
		int resourceId,
		DateTime startTime,
		DateTime endTime,
		int? excludeAppointmentId = null)
	{
		return await _context.Appointments.AnyAsync(x =>
			x.ResourceId == resourceId &&
			x.Status != "Cancelled" &&
			(!excludeAppointmentId.HasValue ||
			 x.Id != excludeAppointmentId.Value) &&
			x.StartTime < endTime &&
			startTime < x.EndTime);
	}
}
