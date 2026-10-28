
namespace Modul44.Application.Interfaces;

public record BusyInterval(DateTime StartTime, DateTime EndTime);

public interface IAvailabilityRepository
{
	Task<List<BusyInterval>> GetBusyIntervalsAsync(
		int resourceId,
		DateTime dayStartUtc,
		DateTime dayEndUtc,
		int? excludeAppointmentId = null);

}
