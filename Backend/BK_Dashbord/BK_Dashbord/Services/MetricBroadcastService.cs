using BK_Dashbord.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace BK_Dashbord.Services
{
    public class MetricBroadcastService(IHubContext<DashboardHub> hubContext, 
        DataGeneratorService generator) : BackgroundService
    {
        private readonly IHubContext<DashboardHub> _hubContext = hubContext;
        private readonly DataGeneratorService _generator = generator;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var cpu = _generator.GenerateMetric("CPU", 45, 10);
                var memory = _generator.GenerateMetric("Memory", 60, 8);
                var rps = _generator.GenerateMetric("RequestsPerSecond", 120, 30);

                await _hubContext.Clients.All.SendAsync("ReceiveMetric", cpu, stoppingToken);
                await _hubContext.Clients.All.SendAsync("ReceiveMetric", memory, stoppingToken);
                await _hubContext.Clients.All.SendAsync("ReceiveMetric", rps, stoppingToken);

                await Task.Delay(2000, stoppingToken); // push every 2 seconds
            }
        }
    }
}
