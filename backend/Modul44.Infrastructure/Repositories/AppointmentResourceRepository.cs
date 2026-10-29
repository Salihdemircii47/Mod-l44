
using Microsoft.EntityFrameworkCore;
using Modul44.Application.Interfaces;
using Modul44.Domain.Entities;
using Modul44.Infrastructure.Data;

namespace Modul44.Infrastructure.Repositories;

public class AppointmentResourceRepository
	: IAppointmentResourceRepository
{
	private readonly AppDbContext _context;

	public AppointmentResourceRepository(AppDbContext context)
	{
		_context = context;
	}

	public async Task<Appointment?>
		GetAppointmentWithResourcesAsync(int id)
	{
		return await _context.Appointments
			.AsNoTracking()
			.Include(x => x.Resource)
			.Include(x => x.AppointmentResources)
				.ThenInclude(x => x.Resource)
			.FirstOrDefaultAsync(x => x.Id == id);
	}
}
