using Microsoft.AspNetCore.SignalR;

namespace BK_Dashbord.Hubs
{
    public class DashboardHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("ReceiveMessage", "Connected to live dashboard hub.");
            await base.OnConnectedAsync();
        }
    }
}
