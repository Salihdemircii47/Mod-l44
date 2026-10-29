using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modul44.Application.DTOs.AppointmentDto
{
	public class CreateAppointmentDto
	{
		[Range(1, int.MaxValue)]
		public int CustomerId { get; set; }

		[Range(1, int.MaxValue)]
		public int ServiceId { get; set; }

		[Range(1, int.MaxValue)]
		public int ResourceId { get; set; }

		public DateTime StartTime { get; set; }

		public DateTime EndTime { get; set; }

		public string? Notes { get; set; }
	}
}
