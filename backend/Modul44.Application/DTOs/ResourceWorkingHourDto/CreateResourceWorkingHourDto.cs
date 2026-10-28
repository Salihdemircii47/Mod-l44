using System.ComponentModel.DataAnnotations;

namespace Modul44.Application.DTOs.ResourceWorkingHourDto
{
	public class CreateResourceWorkingHourDto
	{
		[Range(1, int.MaxValue)]
		public int ResourceId { get; set; }

		[Range(0, 6)]
		public int DayOfWeek { get; set; }

		public TimeOnly StartTime { get; set; }

		public TimeOnly EndTime { get; set; }
	}
}
