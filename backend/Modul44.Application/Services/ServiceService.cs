
using Modul44.Application.DTOs.ServiceDto;
using Modul44.Application.Interfaces;
using ServiceEntity = Modul44.Domain.Entities.Service;

namespace Modul44.Application.Services;

public class ServiceService : IServiceService
{
	private readonly IGenericRepository<ServiceEntity> _repository;

	public ServiceService(
		IGenericRepository<ServiceEntity> repository)
	{
		_repository = repository;
	}

	public async Task<List<ServiceDto>> GetAllAsync()
	{
		var services = await _repository.GetAllAsync();

		return services.Select(MapToDto).ToList();
	}

	public async Task<ServiceDto?> GetByIdAsync(int id)
	{
		var service = await _repository.GetByIdAsync(id);

		return service is null ? null : MapToDto(service);
	}

	public async Task<ServiceDto> CreateAsync(CreateServiceDto dto)
	{
		Validate(dto.Name, dto.Sector);

		var service = new ServiceEntity
		{
			Name = dto.Name.Trim(),
			Sector = dto.Sector.Trim(),
			Description = dto.Description,
			DurationMinutes = dto.DurationMinutes,
			Price = dto.Price
		};

		await _repository.AddAsync(service);
		await _repository.SaveChangesAsync();

		return MapToDto(service);
	}

	public async Task<bool> UpdateAsync(
		int id, UpdateServiceDto dto)
	{
		Validate(dto.Name, dto.Sector);

		var service = await _repository.GetByIdAsync(id);

		if (service is null)
			return false;

		service.Name = dto.Name.Trim();
		service.Sector = dto.Sector.Trim();
		service.Description = dto.Description;
		service.DurationMinutes = dto.DurationMinutes;
		service.Price = dto.Price;

		_repository.Update(service);

		await _repository.SaveChangesAsync();

		return true;
	}

	public async Task<bool> DeleteAsync(int id)
	{
		var service = await _repository.GetByIdAsync(id);

		if (service is null)
			return false;

		_repository.Delete(service);
		await _repository.SaveChangesAsync();

		return true;
	}

	private static void Validate(string name, string sector)
	{
		if (string.IsNullOrWhiteSpace(name))
			throw new ArgumentException(
				"Service name is required.");

		if (string.IsNullOrWhiteSpace(sector))
			throw new ArgumentException(
				"Sector is required.");
	}

	private static ServiceDto MapToDto(ServiceEntity service)
	{
		return new ServiceDto
		{
			Id = service.Id,
			Name = service.Name,
			Sector = service.Sector,
			Description = service.Description,
			DurationMinutes = service.DurationMinutes,
			Price = service.Price
		};
	}
}
