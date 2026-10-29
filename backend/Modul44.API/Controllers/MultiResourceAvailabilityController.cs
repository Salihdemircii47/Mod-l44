
using Microsoft.AspNetCore.Mvc;
using Modul44.Application.DTOs.AvailabilityDto;
using Modul44.Application.Interfaces;

namespace Modul44.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MultiResourceAvailabilityController : ControllerBase
{
	private readonly IMultiResourceAvailabilityService _service;

	public MultiResourceAvailabilityController(
		IMultiResourceAvailabilityService service)
	{
		_service = service;
	}

	[HttpGet]
	public async Task<ActionResult<MultiResourceAvailabilityDto>> Get(
		[FromQuery] int serviceId,
		[FromQuery] DateOnly date,
		[FromQuery] List<int> resourceIds)
	{
		if (serviceId <= 0 || date == default)
		{
			return BadRequest(new
			{
				message = "Valid serviceId and date are required."
			});
		}

		try
		{
			var result = await _service.GetAsync(
				serviceId,
				date,
				resourceIds);

			return Ok(result);
		}
		catch (ArgumentException ex)
		{
			return BadRequest(new { message = ex.Message });
		}
	}
}
