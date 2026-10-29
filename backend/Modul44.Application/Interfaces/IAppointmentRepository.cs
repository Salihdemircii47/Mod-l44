
using Modul44.Domain.Entities;

namespace Modul44.Application.Interfaces;

public interface IAppointmentRepository
	: IGenericRepository<Appointment>
{
	Task<List<Appointment>> GetWithDetailsAsync();

	Task<Appointment?> GetWithDetailsByIdAsync(int id);

	Task<bool> HasConflictAsync(
		int resourceId,
		DateTime startTime,
		DateTime endTime,
		int? excludeAppointmentId = null);
}
