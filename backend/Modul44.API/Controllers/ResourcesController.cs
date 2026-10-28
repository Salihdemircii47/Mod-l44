
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Modul44.Application.DTOs.ResourceDto;
using Modul44.Application.Interfaces;

namespace Modul44.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResourcesController : ControllerBase
{
	private readonly IResourceService _resourceService;

	public ResourcesController(IResourceService resourceService)
	{
		_resourceService = resourceService;
	}

	// GET api/resources
	[HttpGet]
	public async Task<ActionResult<List<ResourceDto>>> GetAll()
	{
		var resources = await _resourceService.GetAllAsync();

		return Ok(resources);
	}

	// GET api/resources/1
	[HttpGet("{id:int}")]
	public async Task<ActionResult<ResourceDto>> GetById(int id)
	{
		var resource = await _resourceService.GetByIdAsync(id);

		if (resource is null)
			return NotFound(new { message = "Resource not found." });

		return Ok(resource);
	}

	// POST api/resources
	[HttpPost]
	public async Task<ActionResult<ResourceDto>> Create(
		[FromBody] CreateResourceDto dto)
	{
		try
		{
			var resource = await _resourceService.CreateAsync(dto);

			return CreatedAtAction(
				nameof(GetById),
				new { id = resource.Id },
				resource);
		}
		catch (ArgumentException ex)
		{
			return BadRequest(new { message = ex.Message });
		}
	}

	// PUT api/resources/1
	[HttpPut("{id:int}")]
	public async Task<IActionResult> Update(
		int id, [FromBody] UpdateResourceDto dto)
	{
		try
		{
			var updated = await _resourceService.UpdateAsync(id, dto);

			if (!updated)
				return NotFound(new { message = "Resource not found." });

			return NoContent();
		}
		catch (ArgumentException ex)
		{
			return BadRequest(new { message = ex.Message });
		}
	}

	// DELETE api/resources/1
	[HttpDelete("{id:int}")]
	public async Task<IActionResult> Delete(int id)
	{
		try
		{
			var deleted = await _resourceService.DeleteAsync(id);

			if (!deleted)
				return NotFound(new { message = "Resource not found." });

			return NoContent();
		}
		catch (DbUpdateException)
		{
			return Conflict(new
			{
				message = "Resource cannot be deleted because related records exist."
			});
		}
	}
}
