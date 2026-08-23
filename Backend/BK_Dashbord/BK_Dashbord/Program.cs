using BK_Dashbord.Hubs;
using BK_Dashbord.Services;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

// add signalR for real-time communication
builder.Services.AddSignalR();

// register services
builder.Services.AddSingleton<DataGeneratorService>();
builder.Services.AddHostedService<MetricBroadcastService>();


// enable CORS for the frontend application
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});


// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference("/docs", options =>
    {
        options.Title = "Live Dashboard API";
    });
}
app.UseHsts();
app.UseHttpsRedirection();

// Use CORS policy
app.UseCors("AllowAngularDev");

app.UseAuthorization();

app.UseRouting();

app.MapControllers();

app.MapHub<DashboardHub>("/hubs/dashboard");

app.Run();
