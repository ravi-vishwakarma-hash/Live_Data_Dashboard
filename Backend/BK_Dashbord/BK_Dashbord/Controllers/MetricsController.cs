using BK_Dashbord.Services;
using Microsoft.AspNetCore.Mvc;

namespace BK_Dashbord.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MetricsController(DataGeneratorService generator) : ControllerBase
    {
        private readonly DataGeneratorService _generator = generator;

        [HttpGet("snapshot")]
        public IActionResult GetSnapshot()
        {
            var data = new[]
            {
                _generator.GenerateMetric("CPU", 45, 10),
                _generator.GenerateMetric("Memory", 60, 8),
                _generator.GenerateMetric("RequestsPerSecond", 120, 30)
            };

            return Ok(data);
        }
    }
}
