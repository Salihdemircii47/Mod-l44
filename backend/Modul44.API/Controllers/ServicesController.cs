
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Modul44.Application.DTOs.ServiceDto;
using Modul44.Application.Interfaces;

namespace Modul44.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
	private readonly IServiceService _serviceService;

	public ServicesController(IServiceService serviceService)
	{
		_serviceService = serviceService;
	}

	// GET api/services
	[HttpGet]
	public async Task<ActionResult<List<ServiceDto>>> GetAll()
	{
		var services = await _serviceService.GetAllAsync();

		return Ok(services);
	}

	// GET api/services/1
	[HttpGet("{id:int}")]
	public async Task<ActionResult<ServiceDto>> GetById(int id)
	{
		var service = await _serviceService.GetByIdAsync(id);

		if (service is null)
			return NotFound(new { message = "Service not found." });

		return Ok(service);
	}

	// POST api/services
	[HttpPost]
	public async Task<ActionResult<ServiceDto>> Create(
		[FromBody] CreateServiceDto dto)
	{
		try
		{
			var service = await _serviceService.CreateAsync(dto);

			return CreatedAtAction(
				nameof(GetById),
				new { id = service.Id },
				service);
		}
		catch (ArgumentException ex)
		{
			return BadRequest(new { message = ex.Message });
		}
	}

	// PUT api/services/1
	[HttpPut("{id:int}")]
	public async Task<IActionResult> Update(
		int id, [FromBody] UpdateServiceDto dto)
	{
		try
		{
			var updated = await _serviceService.UpdateAsync(id, dto);

			if (!updated)
				return NotFound(new { message = "Service not found." });

			return NoContent();
		}
		catch (ArgumentException ex)
		{
			return BadRequest(new { message = ex.Message });
		}
	}

	// DELETE api/services/1
	[HttpDelete("{id:int}")]
	public async Task<IActionResult> Delete(int id)
	{
		try
		{
			var deleted = await _serviceService.DeleteAsync(id);

			if (!deleted)
				return NotFound(new { message = "Service not found." });

			return NoContent();
		}
		catch (DbUpdateException)
		{
			return Conflict(new
			{
				message = "Service cannot be deleted because related records exist."
			});
		}
	}
}
