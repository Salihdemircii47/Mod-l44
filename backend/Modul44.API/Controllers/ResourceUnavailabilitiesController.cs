
using Microsoft.AspNetCore.Mvc;
using Modul44.Application.DTOs.ResourceUnavailabilityDto;
using Modul44.Application.Interfaces;

namespace Modul44.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResourceUnavailabilitiesController : ControllerBase
{
	private readonly IResourceScheduleService _service;

	public ResourceUnavailabilitiesController(
		IResourceScheduleService service)
	{
		_service = service;
	}

	[HttpGet("resource/{resourceId:int}")]
	public async Task<IActionResult> GetByResource(int resourceId)
	{
		try
		{
			var result = await _service
				.GetUnavailabilitiesAsync(resourceId);

			return Ok(result);
		}
		catch (ArgumentException ex)
		{
			return NotFound(new { message = ex.Message });
		}
	}

	[HttpPost]
	public async Task<IActionResult> Create(
		[FromBody] CreateResourceUnavailabilityDto dto)
	{
		try
		{
			var result = await _service
				.AddUnavailabilityAsync(dto);

			return StatusCode(201, result);
		}
		catch (ArgumentException ex)
		{
			return BadRequest(new { message = ex.Message });
		}
	}

	[HttpDelete("{id:int}")]
	public async Task<IActionResult> Delete(int id)
	{
		var deleted = await _service
			.DeleteUnavailabilityAsync(id);

		return deleted ? NoContent() : NotFound();
	}
}
