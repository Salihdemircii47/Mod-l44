
using Microsoft.AspNetCore.Mvc;
using Modul44.Application.DTOs.AvailabilityDto;
using Modul44.Application.Interfaces;

namespace Modul44.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AvailabilityController : ControllerBase
{
	private readonly IAvailabilityService _availabilityService;

	public AvailabilityController(
		IAvailabilityService availabilityService)
	{
		_availabilityService = availabilityService;
	}

	[HttpGet("resource/{resourceId:int}")]
	public async Task<ActionResult<AvailabilityDto>> GetByResource(
		int resourceId,
		[FromQuery] DateOnly date,
		[FromQuery] int serviceId)
	{
		if (resourceId <= 0 || serviceId <= 0 ||
			date == default)
		{
			return BadRequest(new
			{
				message = "Valid resourceId, serviceId and date are required."
			});
		}

		try
		{
			var result = await _availabilityService
				.GetAvailableSlotsAsync(
					resourceId,
					serviceId,
					date);

			return Ok(result);
		}
		catch (ArgumentException ex)
		{
			return BadRequest(new
			{
				message = ex.Message
			});
		}
	}
}
