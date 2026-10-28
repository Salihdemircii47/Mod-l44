
using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Modul44.Application.Interfaces;
using Modul44.Infrastructure.Data;

namespace Modul44.Infrastructure.Transactions;

public class BookingTransactionRunner : IBookingTransactionRunner
{
	private readonly AppDbContext _context;

	private const int LockNamespace = 440044;

	public BookingTransactionRunner(AppDbContext context)
	{
		_context = context;
	}

	public async Task<T> ExecuteAsync<T>(
		IEnumerable<int> resourceIds,
		Func<Task<T>> operation)
	{
		var ids = resourceIds
			.Distinct()
			.OrderBy(x => x)
			.ToList();

		if (ids.Count == 0 || ids.Any(x => x <= 0))
		{
			throw new ArgumentException(
				"At least one valid resource is required.");
		}

		await using var transaction =
			await _context.Database.BeginTransactionAsync(
				IsolationLevel.ReadCommitted);

		try
		{
			foreach (var resourceId in ids)
			{
				await LockResourceAsync(
					resourceId,
					transaction);
			}

			var result = await operation();

			await transaction.CommitAsync();

			return result;
		}
		catch
		{
			await transaction.RollbackAsync();
			throw;
		}
	}

	private async Task LockResourceAsync(
		int resourceId,
		IDbContextTransaction transaction)
	{
		var connection = _context.Database.GetDbConnection();

		await using var command = connection.CreateCommand();

		command.Transaction = transaction.GetDbTransaction();

		command.CommandText =
			"SELECT pg_advisory_xact_lock(@namespace_id, @resource_id)";

		var namespaceParameter = command.CreateParameter();
		namespaceParameter.ParameterName = "namespace_id";
		namespaceParameter.Value = LockNamespace;
		command.Parameters.Add(namespaceParameter);

		var resourceParameter = command.CreateParameter();
		resourceParameter.ParameterName = "resource_id";
		resourceParameter.Value = resourceId;
		command.Parameters.Add(resourceParameter);

		await command.ExecuteScalarAsync();
	}
}
