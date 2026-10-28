
using Modul44.Domain.Entities;

namespace Modul44.Application.Interfaces;

public interface IAppointmentResourceRepository
{
	Task<Appointment?> GetAppointmentWithResourcesAsync(int id);
}
