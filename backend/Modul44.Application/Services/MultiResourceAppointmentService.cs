
using Modul44.Application.DTOs.MultiResourceAppointmentDto;
using Modul44.Application.Interfaces;
using Modul44.Domain.Entities;
using ServiceEntity = Modul44.Domain.Entities.Service;

namespace Modul44.Application.Services;

public class MultiResourceAppointmentService
	: IMultiResourceAppointmentService
{
	private readonly IGenericRepository<Appointment> _appointmentRepository;
	private readonly IGenericRepository<Customer> _customerRepository;
	private readonly IGenericRepository<ServiceEntity> _serviceRepository;
	private readonly IGenericRepository<Resource> _resourceRepository;
	private readonly IAppointmentResourceRepository _assignmentRepository;
	private readonly IAvailabilityService _availabilityService;
	private readonly IBookingTransactionRunner _bookingRunner;

	public MultiResourceAppointmentService(
		IGenericRepository<Appointment> appointmentRepository,
		IGenericRepository<Customer> customerRepository,
		IGenericRepository<ServiceEntity> serviceRepository,
		IGenericRepository<Resource> resourceRepository,
		IAppointmentResourceRepository assignmentRepository,
		IAvailabilityService availabilityService,
		IBookingTransactionRunner bookingRunner)
	{
		_appointmentRepository = appointmentRepository;
		_customerRepository = customerRepository;
		_serviceRepository = serviceRepository;
		_resourceRepository = resourceRepository;
		_assignmentRepository = assignmentRepository;
		_availabilityService = availabilityService;
		_bookingRunner = bookingRunner;
	}


	public async Task<MultiResourceAppointmentDto> CreateAsync(
		CreateMultiResourceAppointmentDto dto)
	{
		if (dto.StartTime.Kind != DateTimeKind.Utc ||
			dto.EndTime.Kind != DateTimeKind.Utc ||
			dto.EndTime <= dto.StartTime)
		{
			throw new ArgumentException(
				"Valid UTC times are required.");
		}

		if (dto.Resources is null || dto.Resources.Count == 0)
		{
			throw new ArgumentException(
				"At least one resource is required.");
		}

		var resourceIds = dto.Resources
			.Select(x => x.ResourceId)
			.ToList();

		if (resourceIds.Any(x => x <= 0) ||
			resourceIds.Distinct().Count() != resourceIds.Count)
		{
			throw new ArgumentException(
				"Resource IDs must be positive and unique.");
		}

		if (dto.Resources.Any(x =>
			string.IsNullOrWhiteSpace(x.Role) ||
			x.Role.Length > 50))
		{
			throw new ArgumentException(
				"Every resource must have a valid role.");
		}

		return await _bookingRunner.ExecuteAsync(
			resourceIds,
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

				var resources = new List<Resource>();

				foreach (var assignment in dto.Resources)
				{
					var resource = await _resourceRepository
						.GetByIdAsync(assignment.ResourceId);

					if (resource is null || !resource.IsActive)
					{
						throw new ArgumentException(
							$"Resource {assignment.ResourceId} unavailable.");
					}

					if (!string.Equals(
						resource.Sector,
						service.Sector,
						StringComparison.OrdinalIgnoreCase))
					{
						throw new ArgumentException(
							$"Resource {resource.Name} belongs to another sector.");
					}

					var available = await _availabilityService
						.IsAvailableAsync(
							resource.Id,
							service.Id,
							dto.StartTime,
							dto.EndTime);

					if (!available)
					{
						throw new InvalidOperationException(
							$"Resource {resource.Name} is already booked or unavailable.");
					}

					resources.Add(resource);
				}

				var appointment = new Appointment
				{
					CustomerId = dto.CustomerId,
					ServiceId = dto.ServiceId,
					ResourceId = resources[0].Id,
					StartTime = dto.StartTime,
					EndTime = dto.EndTime,
					Notes = dto.Notes,
					Status = "Scheduled"
				};

				foreach (var assignment in dto.Resources)
				{
					appointment.AppointmentResources.Add(
						new AppointmentResource
						{
							ResourceId = assignment.ResourceId,
							Role = assignment.Role.Trim()
						});
				}

				await _appointmentRepository.AddAsync(appointment);
				await _appointmentRepository.SaveChangesAsync();

				return new MultiResourceAppointmentDto
				{
					Id = appointment.Id,
					CustomerId = appointment.CustomerId,
					ServiceId = appointment.ServiceId,
					StartTime = appointment.StartTime,
					EndTime = appointment.EndTime,
					Status = appointment.Status,
					Notes = appointment.Notes,
					Resources = dto.Resources.Select(x =>
						new AssignedResourceDetailDto
						{
							ResourceId = x.ResourceId,
							ResourceName = resources
								.First(r => r.Id == x.ResourceId).Name,
							Role = x.Role.Trim()
						}).ToList()
				};
			});
	}

	public async Task<MultiResourceAppointmentDto?> GetByIdAsync(int id)
	{
		var appointment = await _assignmentRepository
			.GetAppointmentWithResourcesAsync(id);

		if (appointment is null)
			return null;

		var assignments = appointment.AppointmentResources
			.Select(x => new AssignedResourceDetailDto
			{
				ResourceId = x.ResourceId,
				ResourceName = x.Resource.Name,
				Role = x.Role
			})
			.ToList();

		if (!assignments.Any(x =>
			x.ResourceId == appointment.ResourceId))
		{
			assignments.Insert(0, new AssignedResourceDetailDto
			{
				ResourceId = appointment.ResourceId,
				ResourceName = appointment.Resource.Name,
				Role = "Primary"
			});
		}

		return new MultiResourceAppointmentDto
		{
			Id = appointment.Id,
			CustomerId = appointment.CustomerId,
			ServiceId = appointment.ServiceId,
			StartTime = appointment.StartTime,
			EndTime = appointment.EndTime,
			Status = appointment.Status,
			Notes = appointment.Notes,
			Resources = assignments
		};
	}
}
