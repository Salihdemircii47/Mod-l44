
using Modul44.Application.DTOs.ResourceDto;

namespace Modul44.Application.Interfaces;

public interface IResourceService
{
	Task<List<ResourceDto>> GetAllAsync();

	Task<ResourceDto?> GetByIdAsync(int id);

	Task<ResourceDto> CreateAsync(CreateResourceDto dto);

	Task<bool> UpdateAsync(int id, UpdateResourceDto dto);

	Task<bool> DeleteAsync(int id);
}
