
namespace Modul44.Application.Interfaces;

public interface IBookingTransactionRunner
{
	Task<T> ExecuteAsync<T>(
		IEnumerable<int> resourceIds,
		Func<Task<T>> operation);
}
