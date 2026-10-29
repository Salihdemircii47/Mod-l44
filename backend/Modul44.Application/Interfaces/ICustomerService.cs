
using Modul44.Application.DTOs.CustomerDto;

namespace Modul44.Application.Interfaces;

public interface ICustomerService
{
	Task<List<CustomerDto>> GetAllAsync();

	Task<CustomerDto?> GetByIdAsync(int id);

	Task<CustomerDto> CreateAsync(CreateCustomerDto dto);

	Task<bool> DeleteAsync(int id);
}
