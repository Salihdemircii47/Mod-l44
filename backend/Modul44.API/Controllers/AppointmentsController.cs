
using Microsoft.AspNetCore.Mvc;
using Modul44.Application.DTOs.AppointmentDto;
using Modul44.Application.Interfaces;

namespace Modul44.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
	private readonly IAppointmentService _appointmentService;
	private readonly IAppointmentRescheduleService _rescheduleService;

	public AppointmentsController(
		IAppointmentService appointmentService,
		IAppointmentRescheduleService rescheduleService)
	{
		_appointmentService = appointmentService;
		_rescheduleService = rescheduleService;
	}

	// GET: api/appointments
	[HttpGet]
	public async Task<ActionResult<List<AppointmentDto>>> GetAll()
	{
		var appointments =
			await _appointmentService.GetAllAsync();

		return Ok(appointments);
	}

	// GET: api/appointments/1
	[HttpGet("{id:int}")]
	public async Task<ActionResult<AppointmentDto>> GetById(int id)
	{
		var appointment =
			await _appointmentService.GetByIdAsync(id);

		if (appointment is null)
		{
			return NotFound(new
			{
				message = "Appointment not found."
			});
		}

		return Ok(appointment);
	}

	// POST: api/appointments
	[HttpPost]
	public async Task<ActionResult<AppointmentDto>> Create(
		[FromBody] CreateAppointmentDto dto)
	{
		try
		{
			var appointment =
				await _appointmentService.CreateAsync(dto);

			return CreatedAtAction(
				nameof(GetById),
				new { id = appointment.Id },
				appointment);
		}
		catch (ArgumentException ex)
		{
			return BadRequest(new
			{
				message = ex.Message
			});
		}
		catch (KeyNotFoundException ex)
		{
			return NotFound(new
			{
				message = ex.Message
			});
		}
		catch (InvalidOperationException ex)
		{
			return Conflict(new
			{
				message = ex.Message
			});
		}
	}

	// PATCH: api/appointments/1/cancel
	[HttpPatch("{id:int}/cancel")]
	public async Task<IActionResult> Cancel(int id)
	{
		try
		{
			var cancelled =
				await _appointmentService.CancelAsync(id);

			if (!cancelled)
			{
				return NotFound(new
				{
					message = "Appointment not found."
				});
			}

			return NoContent();
		}
		catch (InvalidOperationException ex)
		{
			return Conflict(new
			{
				message = ex.Message
			});
		}
	}

	[HttpPatch("{id:int}/reschedule")]
	public async Task<IActionResult> Reschedule(
		int id,
		[FromBody] UpdateAppointmentTimeDto dto)
	{
		try
		{
			var updated = await _rescheduleService
				.RescheduleAsync(id, dto);

			if (!updated)
			{
				return NotFound(new
				{
					message = "Appointment not found."
				});
			}

			return NoContent();
		}
		catch (ArgumentException ex)
		{
			return BadRequest(new
			{
				message = ex.Message
			});
		}
		catch (InvalidOperationException ex)
		{
			return Conflict(new
			{
				message = ex.Message
			});
		}
	}
}
