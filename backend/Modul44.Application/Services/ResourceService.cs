
using Modul44.Application.DTOs.ResourceDto;
using Modul44.Application.Interfaces;
using Modul44.Domain.Entities;

namespace Modul44.Application.Services;

public class ResourceService : IResourceService
{
	private readonly IGenericRepository<Resource> _repository;

	public ResourceService(
		IGenericRepository<Resource> repository)
	{
		_repository = repository;
	}

	public async Task<List<ResourceDto>> GetAllAsync()
	{
		var resources = await _repository.GetAllAsync();

		return resources.Select(MapToDto).ToList();
	}

	public async Task<ResourceDto?> GetByIdAsync(int id)
	{
		var resource = await _repository.GetByIdAsync(id);

		return resource is null ? null : MapToDto(resource);
	}

	public async Task<ResourceDto> CreateAsync(
		CreateResourceDto dto)
	{
		Validate(dto.Name, dto.Type, dto.Sector);

		var resource = new Resource
		{
			Name = dto.Name.Trim(),
			Type = dto.Type.Trim(),
			Sector = dto.Sector.Trim(),
			IsActive = true
		};

		await _repository.AddAsync(resource);
		await _repository.SaveChangesAsync();

		return MapToDto(resource);
	}

	public async Task<bool> UpdateAsync(
		int id, UpdateResourceDto dto)
	{
		Validate(dto.Name, dto.Type, dto.Sector);

		var resource = await _repository.GetByIdAsync(id);

		if (resource is null)
			return false;

		resource.Name = dto.Name.Trim();
		resource.Type = dto.Type.Trim();
		resource.Sector = dto.Sector.Trim();
		resource.IsActive = dto.IsActive;

		_repository.Update(resource);

		await _repository.SaveChangesAsync();

		return true;
	}

	public async Task<bool> DeleteAsync(int id)
	{
		var resource = await _repository.GetByIdAsync(id);

		if (resource is null)
			return false;

		_repository.Delete(resource);
		await _repository.SaveChangesAsync();

		return true;
	}

	private static void Validate(
		string name, string type, string sector)
	{
		if (string.IsNullOrWhiteSpace(name))
			throw new ArgumentException(
				"Resource name is required.");

		if (string.IsNullOrWhiteSpace(type))
			throw new ArgumentException(
				"Resource type is required.");

		if (string.IsNullOrWhiteSpace(sector))
			throw new ArgumentException(
				"Sector is required.");
	}

	private static ResourceDto MapToDto(Resource resource)
	{
		return new ResourceDto
		{
			Id = resource.Id,
			Name = resource.Name,
			Type = resource.Type,
			Sector = resource.Sector,
			IsActive = resource.IsActive
		};
	}
}
