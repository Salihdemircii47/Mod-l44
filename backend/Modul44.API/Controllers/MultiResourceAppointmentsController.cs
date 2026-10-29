
using Microsoft.AspNetCore.Mvc;
using Modul44.Application.DTOs;
using Modul44.Application.DTOs.MultiResourceAppointmentDto;
using Modul44.Application.Interfaces;

namespace Modul44.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MultiResourceAppointmentsController : ControllerBase
{
	private readonly IMultiResourceAppointmentService _service;

	public MultiResourceAppointmentsController(
		IMultiResourceAppointmentService service)
	{
		_service = service;
	}

	[HttpPost]
	public async Task<ActionResult<MultiResourceAppointmentDto>> Create(
		[FromBody] CreateMultiResourceAppointmentDto dto)
	{
		try
		{
			var result = await _service.CreateAsync(dto);

			return CreatedAtAction(
				nameof(GetById),
				new { id = result.Id },
				result);
		}
		catch (ArgumentException ex)
		{
			return BadRequest(new { message = ex.Message });
		}
		catch (InvalidOperationException ex)
		{
			return Conflict(new { message = ex.Message });
		}
	}

	[HttpGet("{id:int}")]
	public async Task<ActionResult<MultiResourceAppointmentDto>>
		GetById(int id)
	{
		var result = await _service.GetByIdAsync(id);

		if (result is null)
			return NotFound(new { message = "Appointment not found." });

		return Ok(result);
	}
}
