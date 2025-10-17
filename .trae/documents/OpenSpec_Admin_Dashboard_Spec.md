# Admin Dashboard Capability Spec

## Purpose
Provide administrators with a comprehensive dashboard for monitoring platform performance, user activity, and business metrics in real-time.

## ADDED Requirements

### Requirement: Real-time platform metrics display
Administrators SHALL view live platform metrics including active users, course completions, and system health.

#### Scenario: View current platform activity
- Given I am an administrator on the dashboard
- When I access the main metrics panel
- Then I see current online users count
- And I see courses completed today
- And I see system health indicators
- And metrics update automatically every 30 seconds

#### Scenario: Monitor system alerts
- Given there are system issues or thresholds exceeded
- When I view the dashboard
- Then critical alerts are prominently displayed
- And I can acknowledge or dismiss alerts
- And alert history is maintained

### Requirement: Executive KPI overview
Administrators SHALL access high-level business metrics and performance indicators.

#### Scenario: View business performance
- Given I am viewing the executive KPI panel
- When I select a time period (day/week/month)
- Then I see user engagement metrics
- And I see course completion rates
- And I see revenue/subscription metrics
- And I see growth trends with visual charts

#### Scenario: Export KPI reports
- Given I want to share metrics with stakeholders
- When I click "Export Report"
- Then I can download metrics as PDF or Excel
- And the report includes selected time period data
- And charts are included in the export

### Requirement: Quick navigation and actions
Administrators SHALL access frequently used admin functions directly from the dashboard.

#### Scenario: Quick access to admin functions
- Given I am on the admin dashboard
- When I need to perform common tasks
- Then I see quick action buttons for user management
- And I see shortcuts to course management
- And I see links to system configuration
- And I can search for specific users or courses

#### Scenario: Customizable dashboard layout
- Given I want to personalize my dashboard
- When I enter customization mode
- Then I can drag and drop widgets
- And I can resize dashboard panels
- And I can hide/show specific metrics
- And my preferences are saved automatically

### Requirement: Multi-tenant organization view
Administrators SHALL switch between different organizational views when managing multiple tenants.

#### Scenario: Switch between organizations
- Given I manage multiple organizations
- When I use the organization selector
- Then dashboard data updates to show selected org
- And metrics are filtered to that organization
- And I maintain separate preferences per org

## Technical Implementation Notes

### Data Architecture
- Real-time metrics via WebSocket connections
- Cached aggregated data for performance
- Time-series data storage for historical trends
- Efficient queries with proper indexing

### Frontend Components
```typescript
interface AdminDashboardProps {
  organizationId?: string;
  refreshInterval?: number;
  customLayout?: DashboardLayout;
}

interface DashboardMetrics {
  activeUsers: number;
  coursesCompleted: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  alerts: SystemAlert[];
  kpis: ExecutiveKPIs;
}
```

### Performance Requirements
- Dashboard loads in < 2 seconds
- Real-time updates with < 1 second latency
- Supports 100+ concurrent admin users
- Graceful degradation if real-time fails

### Security Considerations
- Role-based access to different metrics
- Audit logging for all admin actions
- Secure WebSocket connections
- Data encryption for sensitive metrics

## Database Schema Extensions

```sql
-- Admin dashboard preferences
CREATE TABLE admin_dashboard_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  organization_id UUID,
  layout_config JSONB DEFAULT '{}',
  widget_preferences JSONB DEFAULT '{}',
  refresh_interval INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System alerts
CREATE TABLE system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) CHECK (severity IN ('info', 'warning', 'critical')),
  title VARCHAR(255) NOT NULL,
  message TEXT,
  metadata JSONB DEFAULT '{}',
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time metrics cache
CREATE TABLE metrics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(100) NOT NULL,
  organization_id UUID,
  metric_value JSONB NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_admin_dashboard_preferences_user_id ON admin_dashboard_preferences(user_id);
CREATE INDEX idx_system_alerts_severity ON system_alerts(severity, created_at DESC);
CREATE INDEX idx_metrics_cache_type_org ON metrics_cache(metric_type, organization_id, calculated_at DESC);
```

## API Endpoints

### GET /api/admin/dashboard/metrics
Returns current platform metrics

**Response:**
```json
{
  "activeUsers": 245,
  "coursesCompleted": 1834,
  "systemHealth": "healthy",
  "alerts": [
    {
      "id": "alert-123",
      "type": "high_cpu",
      "severity": "warning",
      "title": "High CPU Usage",
      "message": "Server CPU usage above 80%"
    }
  ],
  "kpis": {
    "userEngagement": 0.85,
    "completionRate": 0.72,
    "revenue": 15420.50
  }
}
```

### POST /api/admin/dashboard/preferences
Save dashboard layout preferences

**Request:**
```json
{
  "layoutConfig": {
    "widgets": [
      {"id": "metrics", "position": {"x": 0, "y": 0, "w": 6, "h": 4}},
      {"id": "alerts", "position": {"x": 6, "y": 0, "w": 6, "h": 4}}
    ]
  },
  "refreshInterval": 30
}
```

### WebSocket /ws/admin/metrics
Real-time metrics updates

**Message Format:**
```json
{
  "type": "metrics_update",
  "data": {
    "activeUsers": 247,
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

## Testing Scenarios

### Unit Tests
- Dashboard component renders correctly
- Metrics calculations are accurate
- WebSocket connections handle errors gracefully
- Layout customization saves properly

### Integration Tests
- Real-time updates work end-to-end
- Multi-tenant data isolation
- Alert system triggers correctly
- Export functionality generates valid files

### Performance Tests
- Dashboard loads under 2 seconds with 1000+ users
- WebSocket handles 100+ concurrent connections
- Database queries execute under 100ms
- Memory usage remains stable over time

## Monitoring and Alerts

### Performance Metrics
- Dashboard load time
- WebSocket connection count
- Database query performance
- Memory and CPU usage

### Business Metrics
- Admin dashboard usage frequency
- Most viewed metrics
- Alert response times
- Export usage patterns

### Error Tracking
- Failed WebSocket connections
- Database query failures
- Export generation errors
- Authentication failures