using BK_Dashbord.Models;

namespace BK_Dashbord.Services
{
    public class DataGeneratorService
    {
        private readonly Random _random = new();

        public MetricData GenerateMetric(string metricName, double baseValue, double variance)
        {
            var change = (_random.NextDouble() * 2 - 1) * variance;
            return new MetricData
            {
                MetricName = metricName,
                Value = Math.Round(baseValue + change, 2),
                Timestamp = DateTime.UtcNow
            };
        }
    }
}
