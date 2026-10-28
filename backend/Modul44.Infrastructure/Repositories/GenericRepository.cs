
using Microsoft.EntityFrameworkCore;
using Modul44.Application.Interfaces;
using Modul44.Infrastructure.Data;

namespace Modul44.Infrastructure.Repositories;

public class GenericRepository<T> : IGenericRepository<T>
	where T : class
{
	protected readonly AppDbContext _context;
	protected readonly DbSet<T> _dbSet;

	public GenericRepository(AppDbContext context)
	{
		_context = context;
		_dbSet = context.Set<T>();
	}

	public virtual async Task<List<T>> GetAllAsync()
	{
		return await _dbSet
			.AsNoTracking()
			.ToListAsync();
	}

	public virtual async Task<T?> GetByIdAsync(int id)
	{
		return await _dbSet.FindAsync(id);
	}

	public async Task AddAsync(T entity)
	{
		await _dbSet.AddAsync(entity);
	}

	public void Update(T entity)
	{
		_dbSet.Update(entity);
	}

	public void Delete(T entity)
	{
		_dbSet.Remove(entity);
	}

	public async Task<int> SaveChangesAsync()
	{
		return await _context.SaveChangesAsync();
	}
}
