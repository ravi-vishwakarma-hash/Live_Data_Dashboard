namespace BK_Dashbord.Models
{
    public class MetricData
    {
        public string MetricName { get; set; } = string.Empty;
        public double Value { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
