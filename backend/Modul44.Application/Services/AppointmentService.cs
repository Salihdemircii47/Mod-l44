
using Modul44.Application.DTOs.AppointmentDto;
using Modul44.Application.Interfaces;
using Modul44.Domain.Entities;

namespace Modul44.Application.Services;

public class AppointmentService : IAppointmentService
{
	private readonly IAppointmentRepository _appointmentRepository;
	private readonly IGenericRepository<Customer> _customerRepository;
	private readonly IGenericRepository<Service> _serviceRepository;
	private readonly IGenericRepository<Resource> _resourceRepository;
	private readonly IAvailabilityService _availabilityService;
	private readonly IBookingTransactionRunner _bookingRunner;

	public AppointmentService(
		IAppointmentRepository appointmentRepository,
		IGenericRepository<Customer> customerRepository,
		IGenericRepository<Service> serviceRepository,
		IGenericRepository<Resource> resourceRepository,
		IAvailabilityService availabilityService,
		IBookingTransactionRunner bookingRunner)
	{
		_appointmentRepository = appointmentRepository;
		_customerRepository = customerRepository;
		_serviceRepository = serviceRepository;
		_resourceRepository = resourceRepository;
		_availabilityService = availabilityService;
		_bookingRunner = bookingRunner;
	}


	public async Task<List<AppointmentDto>> GetAllAsync()
	{
		var appointments =
			await _appointmentRepository.GetWithDetailsAsync();

		return appointments.Select(MapToDto).ToList();
	}

	public async Task<AppointmentDto?> GetByIdAsync(int id)
	{
		var appointment =
			await _appointmentRepository.GetWithDetailsByIdAsync(id);

		return appointment is null
			? null
			: MapToDto(appointment);
	}


	public async Task<AppointmentDto> CreateAsync(
		CreateAppointmentDto dto)
	{
		if (dto.StartTime.Kind != DateTimeKind.Utc ||
			dto.EndTime.Kind != DateTimeKind.Utc ||
			dto.EndTime <= dto.StartTime)
		{
			throw new ArgumentException(
				"Valid UTC appointment times are required.");
		}

		return await _bookingRunner.ExecuteAsync(
			new[] { dto.ResourceId },
			async () =>
			{
				var customer = await _customerRepository
					.GetByIdAsync(dto.CustomerId);

				if (customer is null)
					throw new ArgumentException(
						"Customer not found.");

				var service = await _serviceRepository
					.GetByIdAsync(dto.ServiceId);

				if (service is null)
					throw new ArgumentException(
						"Service not found.");

				var resource = await _resourceRepository
					.GetByIdAsync(dto.ResourceId);

				if (resource is null || !resource.IsActive)
					throw new ArgumentException(
						"Resource unavailable.");

				if (!string.Equals(
					service.Sector,
					resource.Sector,
					StringComparison.OrdinalIgnoreCase))
				{
					throw new ArgumentException(
						"Service and resource sectors do not match.");
				}

				var available = await _availabilityService
					.IsAvailableAsync(
						dto.ResourceId,
						dto.ServiceId,
						dto.StartTime,
						dto.EndTime);

				if (!available)
				{
					throw new InvalidOperationException(
						"Resource is not available for this time range.");
				}

				var appointment = new Appointment
				{
					CustomerId = dto.CustomerId,
					ServiceId = dto.ServiceId,
					ResourceId = dto.ResourceId,
					StartTime = dto.StartTime,
					EndTime = dto.EndTime,
					Notes = dto.Notes,
					Status = "Scheduled"
				};

				await _appointmentRepository.AddAsync(appointment);
				await _appointmentRepository.SaveChangesAsync();

				appointment.Customer = customer;
				appointment.Service = service;
				appointment.Resource = resource;

				return MapToDto(appointment);
			});
	}

	public async Task<bool> CancelAsync(int id)
	{
		var appointment =
			await _appointmentRepository.GetByIdAsync(id);

		if (appointment is null)
			return false;

		if (appointment.Status != "Scheduled")
		{
			throw new InvalidOperationException(
				"Only scheduled appointments can be cancelled.");
		}

		appointment.Status = "Cancelled";

		_appointmentRepository.Update(appointment);

		await _appointmentRepository.SaveChangesAsync();

		return true;
	}

	private static AppointmentDto MapToDto(
		Appointment appointment)
	{
		return new AppointmentDto
		{
			Id = appointment.Id,
			CustomerId = appointment.CustomerId,
			CustomerName = appointment.Customer.FullName,
			ServiceId = appointment.ServiceId,
			ServiceName = appointment.Service.Name,
			ResourceId = appointment.ResourceId,
			ResourceName = appointment.Resource.Name,
			StartTime = appointment.StartTime,
			EndTime = appointment.EndTime,
			Status = appointment.Status,
			Notes = appointment.Notes
		};
	}
}
