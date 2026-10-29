

using Modul44.Application.DTOs.ServiceDto;

namespace Modul44.Application.Interfaces;

public interface IServiceService
{
	Task<List<ServiceDto>> GetAllAsync();

	Task<ServiceDto?> GetByIdAsync(int id);

	Task<ServiceDto> CreateAsync(CreateServiceDto dto);

	Task<bool> UpdateAsync(int id, UpdateServiceDto dto);

	Task<bool> DeleteAsync(int id);
}
