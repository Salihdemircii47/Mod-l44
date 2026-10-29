
using Microsoft.EntityFrameworkCore;
using Modul44.Application.Interfaces;
using Modul44.Application.Services;
using Modul44.Infrastructure.Data;
using Modul44.Infrastructure.Repositories;
using Modul44.Infrastructure.Transactions;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. CONTROLLER SERVICES
// ==========================================

builder.Services.AddControllers();

// ==========================================
// 2. OPENAPI
// ==========================================

builder.Services.AddOpenApi();

// ==========================================
// 3. DATABASE CONNECTION - POSTGRESQL
// ==========================================

var connectionString = builder.Configuration
	.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
	throw new InvalidOperationException(
		"DefaultConnection is not configured.");
}

builder.Services.AddDbContext<AppDbContext>(options =>
	options.UseNpgsql(connectionString));

// ==========================================
// 4. REPOSITORY DEPENDENCY INJECTION
// ==========================================

builder.Services.AddScoped(
	typeof(IGenericRepository<>),
	typeof(GenericRepository<>));

builder.Services.AddScoped<
	IAppointmentRepository,
	AppointmentRepository>();

builder.Services.AddScoped<
	IResourceScheduleRepository,
	ResourceScheduleRepository>();

builder.Services.AddScoped<
	IAvailabilityRepository,
	AvailabilityRepository>();

builder.Services.AddScoped<
	IAppointmentResourceRepository,
	AppointmentResourceRepository>();

builder.Services.AddScoped<
	IBookingTransactionRunner,
	BookingTransactionRunner>();

// ==========================================
// 5. SERVICE DEPENDENCY INJECTION
// ==========================================

builder.Services.AddScoped<
	ICustomerService,
	CustomerService>();

builder.Services.AddScoped<
	IAppointmentService,
	AppointmentService>();

builder.Services.AddScoped<
	IServiceService,
	ServiceService>();

builder.Services.AddScoped<
	IResourceService,
	ResourceService>();

builder.Services.AddScoped<
	IResourceScheduleService,
	ResourceScheduleService>();

builder.Services.AddScoped<
	IAvailabilityService,
	AvailabilityService>();

builder.Services.AddScoped<
	IMultiResourceAppointmentService,
	MultiResourceAppointmentService>();

builder.Services.AddScoped<
	IAppointmentRescheduleService,
	AppointmentRescheduleService>();

builder.Services.AddScoped<
	IMultiResourceAvailabilityService,
	MultiResourceAvailabilityService>();

// ==========================================
// 6. APPLICATION BUILD
// ==========================================


builder.Services.AddCors(options =>
{
	options.AddPolicy("ReactFrontend", policy =>
	{
		policy
			.WithOrigins(
				"http://localhost:5173",
				"http://127.0.0.1:5173"
			)
			.AllowAnyHeader()
			.AllowAnyMethod();
	});
});

var app = builder.Build();

// ==========================================
// 7. HTTP REQUEST PIPELINE
// ==========================================

if (app.Environment.IsDevelopment())
{
	app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("ReactFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
