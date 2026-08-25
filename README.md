# 📊 Live Data Dashboard

A real-time, live-updating data dashboard built with **Angular** and **ASP.NET Core SignalR**.

This project demonstrates how to build a modern dashboard where backend-generated metrics are continuously pushed to the frontend without requiring the client to repeatedly poll the API.

The dashboard currently displays live metrics such as:

* 🖥️ CPU Usage
* 💾 Memory Usage
* 🚀 Requests Per Second
* ⏱️ Real-time timestamps

The backend generates sample metric data and broadcasts updates to all connected Angular clients every **2 seconds** using **SignalR**.

---

## 🚀 Tech Stack

### Backend

* **ASP.NET Core**
* **C#**
* **ASP.NET Core SignalR**
* **BackgroundService**
* **REST API**
* **OpenAPI**
* **Scalar API Documentation**
* Dependency Injection
* CORS

### Frontend

* **Angular 21**
* **TypeScript**
* **Microsoft SignalR Client**
* **Chart.js**
* **ng2-charts**
* **RxJS**

The Angular project uses `@microsoft/signalr`, Chart.js, and `ng2-charts` for real-time communication and data visualization.

---

## 🏗️ Architecture

```text
┌─────────────────────────────┐
│       Angular Dashboard     │
│                             │
│  ┌─────────┐ ┌───────────┐ │
│  │ CPU     │ │  Memory   │ │
│  │ Chart   │ │  Chart    │ │
│  └─────────┘ └───────────┘ │
│                             │
│        SignalR Client       │
└──────────────┬──────────────┘
               │
               │ WebSocket /
               │ SignalR
               ▼
┌─────────────────────────────┐
│       ASP.NET Core API      │
│                             │
│      DashboardHub           │
│             ▲               │
│             │               │
│   MetricBroadcastService    │
│             ▲               │
│             │               │
│    DataGeneratorService     │
└─────────────────────────────┘
```

---

## ✨ How It Works

The application follows a simple real-time data flow.

### 1. Backend starts

ASP.NET Core registers:

* Controllers
* SignalR
* `DataGeneratorService`
* `MetricBroadcastService`

SignalR is mapped to:

```text
/hubs/dashboard
```

The backend configuration also enables CORS for the Angular development server.

---

### 2. Metrics are generated

`DataGeneratorService` creates simulated metric values.

The current implementation generates values around predefined base values with a configurable variance.

For example:

```text
CPU                  → Base: 45
Memory               → Base: 60
RequestsPerSecond    → Base: 120
```

The generated metric contains:

```text
MetricName
Value
Timestamp
```

This structure is represented by the `MetricData` model.

---

### 3. Background service broadcasts metrics

`MetricBroadcastService` runs as an ASP.NET Core `BackgroundService`.

Every 2 seconds it:

1. Generates CPU data
2. Generates memory data
3. Generates request-per-second data
4. Sends each metric to connected SignalR clients
5. Waits for 2 seconds
6. Repeats

The SignalR event currently used by the backend is:

```text
ReceiveMetric
```

---

### 4. Angular receives live updates

The Angular application connects to:

```text
/hubs/dashboard
```

Once connected, the client listens for:

```text
ReceiveMetric
```

Whenever the backend sends a new metric, the Angular dashboard can update its charts immediately.

This eliminates the need for continuously calling the REST API to check whether new data is available.

---

## 🔌 REST API

The project also exposes a snapshot API.

### Get Current Metrics

```http
GET /api/Metrics/snapshot
```

Example response:

```json
[
  {
    "metricName": "CPU",
    "value": 47.23,
    "timestamp": "2026-08-24T17:30:00Z"
  },
  {
    "metricName": "Memory",
    "value": 58.41,
    "timestamp": "2026-08-24T17:30:00Z"
  },
  {
    "metricName": "RequestsPerSecond",
    "value": 127.84,
    "timestamp": "2026-08-24T17:30:00Z"
  }
]
```

The snapshot endpoint is implemented by `MetricsController`.

---

## 📡 SignalR Hub

The dashboard SignalR hub is available at:

```text
/hubs/dashboard
```

The hub also sends a connection message when a client connects:

```text
Connected to live dashboard hub.
```

### SignalR Event

The server broadcasts:

```text
ReceiveMetric
```

with a `MetricData` object.

---

## 📁 Project Structure

```text
Live_Data_Dashboard/
│
├── Backend/
│   └── BK_Dashbord/
│       ├── BK_Dashbord.slnx
│       │
│       └── BK_Dashbord/
│           ├── Controllers/
│           │   └── MetricsController.cs
│           │
│           ├── Hubs/
│           │   └── DashboardHub.cs
│           │
│           ├── Models/
│           │   └── MetricData.cs
│           │
│           ├── Services/
│           │   ├── DataGeneratorService.cs
│           │   └── MetricBroadcastService.cs
│           │
│           ├── Program.cs
│           ├── appsettings.json
│           └── appsettings.Development.json
│
└── Frontend/
    └── live-dashbord-client/
        ├── src/
        ├── public/
        ├── angular.json
        ├── package.json
        └── package-lock.json
```

---

# 🛠️ Getting Started

## Prerequisites

Make sure you have installed:

* .NET SDK
* Node.js
* npm
* Angular CLI

Check your installations:

```bash
dotnet --version
node --version
npm --version
ng version
```

---

# ▶️ Run the Backend

Navigate to the backend project:

```bash
cd Backend/BK_Dashbord/BK_Dashbord
```

Run the application:

```bash
dotnet run
```

The ASP.NET Core application will start using the configured HTTP/HTTPS endpoints.

---

# ▶️ Run the Angular Frontend

Open another terminal:

```bash
cd Frontend/live-dashbord-client
```

Install dependencies:

```bash
npm install
```

Start Angular:

```bash
npm start
```

The Angular development server runs on:

```text
http://localhost:4200
```

The backend CORS policy is configured to allow this development origin.

<img width="1896" height="987" alt="image" src="https://github.com/user-attachments/assets/a69fbdda-742e-49b9-8ea2-c1cb3e1e327a" />


---

# 📖 API Documentation

The backend uses OpenAPI and Scalar for API documentation.

In the development environment, the API documentation is available at:

```text
/docs
```

The Scalar page is configured with the title:

```text
Live Dashboard API
```

---

# 🔄 Real-Time Data Flow

```text
DataGeneratorService
        │
        ▼
Generate CPU / Memory / RPS
        │
        ▼
MetricBroadcastService
        │
        ▼
SignalR Hub
        │
        ▼
Angular SignalR Client
        │
        ▼
Dashboard Components
        │
        ▼
Charts / Metrics
```

Unlike traditional polling:

```text
Angular ──► API
Angular ──► API
Angular ──► API
Angular ──► API
```

SignalR allows the server to push changes:

```text
Backend
   │
   ├──► Angular
   ├──► Angular
   └──► Angular
```

This makes the application suitable for real-time monitoring scenarios.

---

# 📊 Current Metrics

| Metric              | Description                  | Base Value |
| ------------------- | ---------------------------- | ---------: |
| CPU                 | Simulated CPU utilization    |         45 |
| Memory              | Simulated memory utilization |         60 |
| Requests Per Second | Simulated request throughput |        120 |

The values are currently generated using random variance and are intended for demonstration purposes.

---

# 🎯 Learning Objectives

This project demonstrates several important concepts:

* Building REST APIs with ASP.NET Core
* Implementing SignalR
* Server-to-client real-time communication
* Angular SignalR integration
* Background services in .NET
* Dependency Injection
* CORS configuration
* Real-time chart updates
* OpenAPI documentation
* Scalar API documentation
* Separation of responsibilities between services

---

# 🔮 Future Improvements

Possible improvements include:

* [ ] Connect to real server/system metrics
* [ ] Add authentication and authorization
* [ ] Store historical metrics in a database
* [ ] Add PostgreSQL or SQL Server support
* [ ] Add configurable refresh intervals
* [ ] Add multiple dashboard pages
* [ ] Add alerts and threshold notifications
* [ ] Add metric filtering
* [ ] Add date/time range selection
* [ ] Add historical charts
* [ ] Add Docker support
* [ ] Add production deployment configuration
* [ ] Add automated tests
* [ ] Add structured logging
* [ ] Add health checks
* [ ] Add Redis backplane for SignalR scaling

---

# 🔐 Production Considerations

The current project is primarily a demonstration of real-time communication.

For production usage, consider adding:

### Authentication

Protect the SignalR hub and API endpoints using JWT or another authentication mechanism.

### Persistent Storage

Instead of generating random data, collect metrics from a real monitoring source and persist historical values.

### Scaling

For multiple backend instances, consider a SignalR scale-out solution such as a Redis backplane or a managed SignalR service.

### Security

Restrict CORS origins instead of allowing development-only origins in production.

### Observability

Add:

* Structured logging
* Application metrics
* Distributed tracing
* Health checks
* Error monitoring

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/my-feature
```

3. Make your changes
4. Commit your changes

```bash
git commit -m "Add my feature"
```

5. Push the branch

```bash
git push origin feature/my-feature
```

6. Open a Pull Request

---

# 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Ravi Vishwakarma**

GitHub: [ravi-vishwakarma-hash](https://github.com/ravi-vishwakarma-hash?utm_source=chatgpt.com)

---

## ⭐ Support

If you find this project useful, consider giving it a ⭐ on GitHub.

Repository:

[Live_Data_Dashboard](https://github.com/ravi-vishwakarma-hash/Live_Data_Dashboard?utm_source=chatgpt.com)
