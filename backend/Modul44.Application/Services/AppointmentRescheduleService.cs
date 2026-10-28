
using Modul44.Application.DTOs.AppointmentDto;
using Modul44.Application.Interfaces;
using Modul44.Domain.Entities;

namespace Modul44.Application.Services;

public class AppointmentRescheduleService
	: IAppointmentRescheduleService
{
	private readonly IGenericRepository<Appointment>
		_appointmentRepository;

	private readonly IAppointmentResourceRepository
		_assignmentRepository;

	private readonly IAvailabilityService
		_availabilityService;

	private readonly IBookingTransactionRunner
		_bookingRunner;

	public AppointmentRescheduleService(
		IGenericRepository<Appointment> appointmentRepository,
		IAppointmentResourceRepository assignmentRepository,
		IAvailabilityService availabilityService,
		IBookingTransactionRunner bookingRunner)
	{
		_appointmentRepository = appointmentRepository;
		_assignmentRepository = assignmentRepository;
		_availabilityService = availabilityService;
		_bookingRunner = bookingRunner;
	}

	public async Task<bool> RescheduleAsync(
		int appointmentId,
		UpdateAppointmentTimeDto dto)
	{
		if (dto.StartTime.Kind != DateTimeKind.Utc ||
			dto.EndTime.Kind != DateTimeKind.Utc ||
			dto.EndTime <= dto.StartTime)
		{
			throw new ArgumentException(
				"Valid UTC times are required.");
		}

		var snapshot = await _assignmentRepository
			.GetAppointmentWithResourcesAsync(appointmentId);

		if (snapshot is null)
			return false;

		var resourceIds = GetResourceIds(snapshot);

		return await _bookingRunner.ExecuteAsync(
			resourceIds,
			async () =>
			{
				var current = await _assignmentRepository
					.GetAppointmentWithResourcesAsync(appointmentId);

				if (current is null)
					return false;

				var currentIds = GetResourceIds(current);

				if (!resourceIds.SequenceEqual(currentIds))
				{
					throw new InvalidOperationException(
						"Resource assignments changed. Retry.");
				}

				if (current.Status != "Scheduled")
				{
					throw new InvalidOperationException(
						"Only scheduled appointments can be rescheduled.");
				}

				foreach (var resourceId in currentIds)
				{
					var available = await _availabilityService
						.IsAvailableAsync(
							resourceId,
							current.ServiceId,
							dto.StartTime,
							dto.EndTime,
							appointmentId);

					if (!available)
					{
						throw new InvalidOperationException(
							$"Resource {resourceId} is unavailable.");
					}
				}

				var appointment =
					await _appointmentRepository.GetByIdAsync(
						appointmentId);

				if (appointment is null)
					return false;

				appointment.StartTime = dto.StartTime;
				appointment.EndTime = dto.EndTime;

				_appointmentRepository.Update(appointment);

				await _appointmentRepository.SaveChangesAsync();

				return true;
			});
	}

	private static List<int> GetResourceIds(
		Appointment appointment)
	{
		return appointment.AppointmentResources
			.Select(x => x.ResourceId)
			.Append(appointment.ResourceId)
			.Distinct()
			.OrderBy(x => x)
			.ToList();
	}
}
