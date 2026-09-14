# Live Data Dashboard

An Angular 21 frontend for monitoring live metrics delivered by an ASP.NET Core API and SignalR hub.

## Implemented features

- Live metric updates through SignalR with automatic reconnect status.
- Initial metric snapshot loading with retry and error states.
- Search and sort controls for metrics.
- Configurable chart history windows.
- Persistent metric history in browser storage.
- Minimum, average, and maximum statistics.
- Warning and critical threshold indicators.
- Active alerts and recent alert history.
- Optional browser notifications for critical alerts.
- Clickable metric details dialog with chart and statistics.
- Hide/show metric cards with a saved dashboard layout.
- Dark/light theme preference saved in browser storage.
- CSV export for the currently filtered metrics.
- Responsive dashboard layout.

## Backend contract

The frontend expects:

- `GET {apiBaseUrl}/api/metrics/snapshot` returning `MetricData[]`.
- SignalR hub at `{apiBaseUrl}/hubs/dashboard`.
- A `ReceiveMetric` event containing metric data.

Each metric can include optional display and alert metadata:

```json
{
  "metricName": "CPU Usage",
  "value": 42.5,
  "timestamp": "2026-09-13T12:00:00Z",
  "unit": "%",
  "warningThreshold": 70,
  "criticalThreshold": 90
}
```

## Development

```bash
npm install
npm start
```

Open `http://localhost:4200/`.

## Build and tests

```bash
npm run build
npm test -- --watch=false
```

## Remaining roadmap

- Backend-backed historical queries for custom date ranges.
- Alert acknowledgement and server-side alert storage.
- Authentication, user profiles, and role-based access.
- Multiple named dashboards with server-side persistence.
- End-to-end browser tests.

## Configuration

Update the API URL in:

- `src/environments/environment.ts`
- `src/environments/environment.development.ts`