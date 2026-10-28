
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Modul44.Application.DTOs.CustomerDto;
using Modul44.Application.Interfaces;

namespace Modul44.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
	private readonly ICustomerService _customerService;

	public CustomersController(
		ICustomerService customerService)
	{
		_customerService = customerService;
	}

	// GET: api/customers
	[HttpGet]
	public async Task<ActionResult<List<CustomerDto>>> GetAll()
	{
		var customers = await _customerService.GetAllAsync();

		return Ok(customers);
	}

	// GET: api/customers/1
	[HttpGet("{id:int}")]
	public async Task<ActionResult<CustomerDto>> GetById(int id)
	{
		var customer = await _customerService.GetByIdAsync(id);

		if (customer is null)
		{
			return NotFound(new
			{
				message = "Customer not found."
			});
		}

		return Ok(customer);
	}

	// POST: api/customers
	[HttpPost]
	public async Task<ActionResult<CustomerDto>> Create(
		[FromBody] CreateCustomerDto dto)
	{
		try
		{
			var customer = await _customerService.CreateAsync(dto);

			return CreatedAtAction(
				nameof(GetById),
				new { id = customer.Id },
				customer);
		}
		catch (ArgumentException ex)
		{
			return BadRequest(new
			{
				message = ex.Message
			});
		}
	}

	// DELETE: api/customers/1
	[HttpDelete("{id:int}")]
	public async Task<IActionResult> Delete(int id)
	{
		try
		{
			var deleted = await _customerService.DeleteAsync(id);

			if (!deleted)
			{
				return NotFound(new
				{
					message = "Customer not found."
				});
			}

			return NoContent();
		}
		catch (DbUpdateException)
		{
			return Conflict(new
			{
				message = "Customer cannot be deleted because related records exist."
			});
		}
	}
}
