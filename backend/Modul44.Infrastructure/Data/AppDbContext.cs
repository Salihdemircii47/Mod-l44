using Microsoft.EntityFrameworkCore;
using Modul44.Domain.Entities;

namespace Modul44.Infrastructure.Data;

public class AppDbContext : DbContext
{
	public AppDbContext(DbContextOptions<AppDbContext> options)
		: base(options)
	{
	}

	public DbSet<Customer> Customers => Set<Customer>();
	public DbSet<Service> Services => Set<Service>();
	public DbSet<Resource> Resources => Set<Resource>();
	public DbSet<Appointment> Appointments => Set<Appointment>();
	public DbSet<ResourceWorkingHour> ResourceWorkingHours => Set<ResourceWorkingHour>();
	public DbSet<ResourceUnavailability> ResourceUnavailabilities => Set<ResourceUnavailability>();
	public DbSet<AppointmentResource> AppointmentResources => Set<AppointmentResource>();

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		base.OnModelCreating(modelBuilder);

		modelBuilder.Entity<Customer>(entity =>
		{
			entity.HasKey(x => x.Id);

			entity.Property(x => x.FullName)
				.IsRequired()
				.HasMaxLength(150);

			entity.Property(x => x.Phone)
				.HasMaxLength(30);
		});

		modelBuilder.Entity<Service>(entity =>
		{
			entity.HasKey(x => x.Id);

			entity.Property(x => x.Name)
				.IsRequired()
				.HasMaxLength(150);

			entity.Property(x => x.Sector)
				.IsRequired()
				.HasMaxLength(50);

			entity.Property(x => x.Price)
				.HasPrecision(12, 2);
		});

		modelBuilder.Entity<Resource>(entity =>
		{
			entity.HasKey(x => x.Id);

			entity.Property(x => x.Name)
				.IsRequired()
				.HasMaxLength(150);

			entity.Property(x => x.Type)
				.HasMaxLength(50);

			entity.Property(x => x.Sector)
				.HasMaxLength(50);
		});

		modelBuilder.Entity<Appointment>(entity =>
		{
			entity.HasKey(x => x.Id);

			entity.HasOne(x => x.Customer)
				.WithMany(x => x.Appointments)
				.HasForeignKey(x => x.CustomerId)
				.OnDelete(DeleteBehavior.Restrict);

			entity.HasOne(x => x.Service)
				.WithMany(x => x.Appointments)
				.HasForeignKey(x => x.ServiceId)
				.OnDelete(DeleteBehavior.Restrict);

			entity.HasOne(x => x.Resource)
				.WithMany(x => x.Appointments)
				.HasForeignKey(x => x.ResourceId)
				.OnDelete(DeleteBehavior.Restrict);

			entity.HasIndex(x => new
			{
				x.ResourceId,
				x.StartTime,
				x.EndTime
			});


			modelBuilder.Entity<ResourceWorkingHour>(entity =>
			{
				entity.HasKey(x => x.Id);

				entity.HasOne(x => x.Resource)
					.WithMany()
					.HasForeignKey(x => x.ResourceId)
					.OnDelete(DeleteBehavior.Cascade);

				entity.Property(x => x.DayOfWeek)
					.HasConversion<int>();

				entity.Property(x => x.StartTime)
					.HasColumnType("time without time zone");

				entity.Property(x => x.EndTime)
					.HasColumnType("time without time zone");

				entity.HasIndex(x => new
				{
					x.ResourceId,
					x.DayOfWeek
				});
			});

			modelBuilder.Entity<ResourceUnavailability>(entity =>
			{
				entity.HasKey(x => x.Id);

				entity.HasOne(x => x.Resource)
					.WithMany()
					.HasForeignKey(x => x.ResourceId)
					.OnDelete(DeleteBehavior.Cascade);

				entity.Property(x => x.Reason)
					.IsRequired()
					.HasMaxLength(50);

				entity.Property(x => x.Description)
					.HasMaxLength(500);

				entity.HasIndex(x => new
				{
					x.ResourceId,
					x.StartTime,
					x.EndTime
				});
			});

			modelBuilder.Entity<AppointmentResource>(entity =>
			{
				entity.HasKey(x => x.Id);

				entity.HasOne(x => x.Appointment)
					.WithMany(x => x.AppointmentResources)
					.HasForeignKey(x => x.AppointmentId)
					.OnDelete(DeleteBehavior.Cascade);

				entity.HasOne(x => x.Resource)
					.WithMany(x => x.AppointmentResources)
					.HasForeignKey(x => x.ResourceId)
					.OnDelete(DeleteBehavior.Restrict);

				entity.Property(x => x.Role)
					.IsRequired()
					.HasMaxLength(50);

				entity.HasIndex(x => new
				{
					x.AppointmentId,
					x.ResourceId
				}).IsUnique();

				entity.HasIndex(x => x.ResourceId);
			});

		});
	}
}