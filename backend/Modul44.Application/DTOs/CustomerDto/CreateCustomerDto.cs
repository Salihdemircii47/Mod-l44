
using System.ComponentModel.DataAnnotations;

namespace Modul44.Application.DTOs.CustomerDto;

public class CreateCustomerDto
{
	[Required]
	[MaxLength(150)]
	public string FullName { get; set; } = string.Empty;

	[MaxLength(30)]
	public string Phone { get; set; } = string.Empty;

	[EmailAddress]
	public string? Email { get; set; }

	public string? Address { get; set; }
}
