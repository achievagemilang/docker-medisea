# Grafana Production Monitoring Setup

This directory contains Grafana provisioning configuration for production monitoring of the Medisea application.

## Structure

```
grafana/
├── provisioning/
│   ├── datasources/
│   │   └── prometheus.yml          # All datasources (Prometheus, Loki, Jaeger)
│   └── dashboards/
│       ├── dashboard.yml           # Dashboard provisioning configuration
│       ├── medisea-api-overview.json      # API overview dashboard
│       ├── medisea-api-detailed.json      # Detailed API metrics dashboard
│       ├── medisea-system-health.json     # System health dashboard
│       ├── medisea-traces.json            # Distributed tracing dashboard
│       ├── medisea-logs.json              # Application logs dashboard
│       └── medisea-unified-monitoring.json # Unified monitoring dashboard
└── README.md
```

## Dashboards

### 1. Medisea API - Overview

**Purpose**: High-level overview of API performance and health

**Metrics**:

- Request Rate (requests per second)
- Request Duration (p95 latency)
- Error Rate (5xx errors)
- In-Flight Requests (concurrent requests)
- HTTP Status Code Distribution
- Top Routes by Request Rate

**Refresh Interval**: 10 seconds

### 2. Medisea API - Detailed Metrics

**Purpose**: Detailed breakdown of API performance by route and method

**Metrics**:

- Request Rate by Route
- Request Duration Percentiles (p50, p90, p95, p99)
- Request Duration by Route
- Error Rate by Status Code
- Error Rate by Route
- Request Rate by HTTP Method
- Success vs Error Rate Comparison

**Refresh Interval**: 10 seconds

### 3. Medisea System Health

**Purpose**: System-level health indicators and alerts

**Metrics**:

- Total Request Rate (stat panel with thresholds)
- Error Rate (stat panel with thresholds)
- P95 Latency (stat panel with thresholds)
- In-Flight Requests (stat panel with thresholds)
- Request Rate Trend
- Error Rate Trend (with alerting)
- Latency Percentiles
- Status Code Distribution

**Refresh Interval**: 30 seconds

### 4. Medisea Traces - Distributed Tracing

**Purpose**: Distributed tracing visualization using Jaeger

**Features**:

- Trace Search - Search and filter traces by service, operation, tags
- Service Map - Visual representation of service dependencies
- Trace Timeline - Detailed view of trace spans and timing
- Integration with logs (click trace ID to view related logs)

**Refresh Interval**: 10 seconds

### 5. Medisea Logs - Application Logs

**Purpose**: Centralized log aggregation and analysis using Loki

**Features**:

- Log Explorer - Browse and search all application logs
- Error Logs - Filtered view of error messages
- Log Volume by Container - Monitor log generation rate
- Log Volume by Log Level - Breakdown by severity (info, warn, error)
- Recent Errors Table - Quick view of latest errors

**Refresh Interval**: 10 seconds

### 6. Medisea Unified Monitoring

**Purpose**: Combined view of metrics, logs, and traces in one dashboard

**Features**:

- Key metrics at a glance (Request Rate, Error Rate, Latency, Log Volume)
- API metrics trends
- Recent logs stream
- Trace search integration
- Error logs panel
- Service map visualization

**Refresh Interval**: 30 seconds

## Metrics Available

The backend exposes the following OpenTelemetry metrics via the OTel Collector:

1. **http_server_requests_total** (Counter)

   - Labels: `env`, `method`, `route`, `status`
   - Description: Total number of HTTP responses

2. **http_server_request_duration_seconds** (Histogram)

   - Labels: `env`, `method`, `route`, `status`
   - Description: HTTP server request duration in seconds

3. **http_server_in_flight_requests** (UpDownCounter)
   - Labels: `env`, `method`
   - Description: Current number of in-flight HTTP requests

## Accessing Grafana

1. **URL**: http://localhost:3000
2. **Default Credentials**:
   - Username: `admin`
   - Password: `admin` (change on first login)

## Configuration

### Datasources

#### Prometheus

- **Type**: Prometheus
- **URL**: http://prometheus:9090
- **Access**: Proxy mode
- **Scrape Interval**: 15 seconds
- **Purpose**: Metrics collection

#### Loki

- **Type**: Loki
- **URL**: http://localloki:3100
- **Access**: Proxy mode
- **Purpose**: Log aggregation
- **Features**:
  - Derived fields for trace correlation
  - Max lines: 1000

#### Jaeger

- **Type**: Jaeger
- **URL**: http://localjaeger:16686
- **Access**: Proxy mode
- **Purpose**: Distributed tracing
- **Features**:
  - Traces to logs correlation
  - Node graph visualization
  - Span bar customization

### Dashboard Auto-Provisioning

Dashboards are automatically provisioned from JSON files in the `provisioning/dashboards/` directory. They will appear in the "Production" folder in Grafana.

## Production Considerations

1. **Scrape Interval**: Currently set to 15s in `prometheus.yml`. Adjust based on:

   - Volume of metrics
   - Storage capacity
   - Alerting requirements

2. **Retention**: Configure Prometheus retention policy based on storage capacity:

   ```yaml
   # In prometheus.yml or via command line
   --storage.tsdb.retention.time=30d
   ```

3. **Alerting**: Set up alerting rules in Prometheus for:

   - High error rates (>10 errors/sec)
   - High latency (p95 > 1s)
   - Service downtime

4. **Security**:

   - Change default Grafana admin password
   - Set up authentication (LDAP, OAuth, etc.)
   - Use HTTPS in production
   - Restrict access to monitoring endpoints

5. **Backup**: Regularly backup Grafana dashboards and Prometheus data

## Customization

To customize dashboards:

1. Edit the JSON files in `provisioning/dashboards/`
2. Restart Grafana container: `docker compose restart grafana`
3. Changes will be automatically applied

## Troubleshooting

### Dashboards not appearing

- Check Grafana logs: `docker compose logs grafana`
- Verify provisioning directory is mounted correctly
- Check file permissions

### No data in dashboards

- Verify Prometheus is scraping metrics: http://localhost:9090/targets
- Check OTel Collector is running: `docker compose ps otel-collector`
- Verify backend is sending metrics (check logs)

### Metrics not matching

- Ensure `MEDISEA_ENV=production` is set in backend environment
- Verify metric names match between backend and dashboards
- Check Prometheus query syntax
