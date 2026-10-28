using Modul44.Application.DTOs.CustomerDto;
using Modul44.Application.Interfaces;
using Modul44.Domain.Entities;

namespace Modul44.Application.Services;

public class CustomerService : ICustomerService
{
	private readonly IGenericRepository<Customer> _repository;

	public CustomerService(
		IGenericRepository<Customer> repository)
	{
		_repository = repository;
	}

	public async Task<List<CustomerDto>> GetAllAsync()
	{
		var customers = await _repository.GetAllAsync();

		return customers.Select(MapToDto).ToList();
	}

	public async Task<CustomerDto?> GetByIdAsync(int id)
	{
		var customer = await _repository.GetByIdAsync(id);

		return customer is null
			? null
			: MapToDto(customer);
	}

	public async Task<CustomerDto> CreateAsync(
		CreateCustomerDto dto)
	{
		if (string.IsNullOrWhiteSpace(dto.FullName))
		{
			throw new ArgumentException(
				"Customer name is required.");
		}

		var customer = new Customer
		{
			FullName = dto.FullName.Trim(),
			Phone = dto.Phone?.Trim() ?? string.Empty,
			Email = dto.Email,
			Address = dto.Address
		};

		await _repository.AddAsync(customer);

		await _repository.SaveChangesAsync();

		return MapToDto(customer);
	}

	public async Task<bool> DeleteAsync(int id)
	{
		var customer = await _repository.GetByIdAsync(id);

		if (customer is null)
			return false;

		_repository.Delete(customer);

		await _repository.SaveChangesAsync();

		return true;
	}

	private static CustomerDto MapToDto(Customer customer)
	{
		return new CustomerDto
		{
			Id = customer.Id,
			FullName = customer.FullName,
			Phone = customer.Phone,
			Email = customer.Email,
			Address = customer.Address,
			CreatedAt = customer.CreatedAt
		};
	}
}
