
using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Modul44.Application.Interfaces;
using Modul44.Infrastructure.Data;

namespace Modul44.Infrastructure.Transactions;

public class BookingTransactionRunner : IBookingTransactionRunner
{
	private readonly AppDbContext _context;

	private const int ResourceLockNamespace = 440044;
	private const int AppointmentLockNamespace = 440045;

	public BookingTransactionRunner(AppDbContext context)
	{
		_context = context;
	}

	public async Task<T> ExecuteAsync<T>(
		IEnumerable<int> resourceIds,
		Func<Task<T>> operation)
	{
		ArgumentNullException.ThrowIfNull(resourceIds);
		ArgumentNullException.ThrowIfNull(operation);

		var ids = resourceIds
			.Distinct()
			.OrderBy(id => id)
			.ToList();

		ValidateResourceIds(ids, allowEmpty: false);

		await using var transaction =
			await _context.Database.BeginTransactionAsync(
				IsolationLevel.ReadCommitted);

		try
		{
			foreach (var resourceId in ids)
			{
				await AcquireLockAsync(
					ResourceLockNamespace,
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
	
	public async Task<T> ExecuteAppointmentAsync<T>(
		int appointmentId,
		Func<Task<IReadOnlyCollection<int>>> loadResourceIds,
		Func<Task<T>> operation)
	{
		if (appointmentId <= 0)
		{
			throw new ArgumentException(
				"Invalid appointment ID.");
		}

		ArgumentNullException.ThrowIfNull(loadResourceIds);
		ArgumentNullException.ThrowIfNull(operation);

		await using var transaction =
			await _context.Database.BeginTransactionAsync(
				IsolationLevel.ReadCommitted);

		try
		{
			await AcquireLockAsync(
				AppointmentLockNamespace,
				appointmentId,
				transaction);

			var loadedIds = await loadResourceIds();

			if (loadedIds is null)
			{
				throw new InvalidOperationException(
					"Resource assignments could not be loaded.");
			}

			var resourceIds = loadedIds
				.Distinct()
				.OrderBy(id => id)
				.ToList();

			ValidateResourceIds(
				resourceIds,
				allowEmpty: true);

			foreach (var resourceId in resourceIds)
			{
				await AcquireLockAsync(
					ResourceLockNamespace,
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
	private async Task AcquireLockAsync(
		int namespaceId,
		int objectId,
		IDbContextTransaction transaction)
	{
		var connection = _context.Database.GetDbConnection();

		await using var command = connection.CreateCommand();

		command.Transaction = transaction.GetDbTransaction();

		command.CommandText =
			"SELECT pg_advisory_xact_lock(@namespace_id, @object_id)";

		var namespaceParameter = command.CreateParameter();
		namespaceParameter.ParameterName = "namespace_id";
		namespaceParameter.Value = namespaceId;

		command.Parameters.Add(namespaceParameter);

		var objectParameter = command.CreateParameter();
		objectParameter.ParameterName = "object_id";
		objectParameter.Value = objectId;

		command.Parameters.Add(objectParameter);

		await command.ExecuteScalarAsync();
	}
	private static void ValidateResourceIds(
		IReadOnlyCollection<int> resourceIds,
		bool allowEmpty)
	{
		if (!allowEmpty && resourceIds.Count == 0)
		{
			throw new ArgumentException(
				"At least one resource is required.");
		}

		if (resourceIds.Any(id => id <= 0))
		{
			throw new ArgumentException(
				"Resource IDs must be positive.");
		}
	}
}
