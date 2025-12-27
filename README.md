# LeanBuild AI - Construction Waste Management Platform

## High-Level Strategy and Goal

LeanBuild AI is a comprehensive lean construction management platform that helps construction teams identify, track, and eliminate the 8 wastes (DOWNTIME) while implementing continuous improvement methodologies. The platform combines AI-powered analytics with proven lean construction techniques including Last Planner System, 5S, Kaizen, and Value Stream Mapping.

**Primary Goals:**

- Reduce construction waste by 20-50% through data-driven insights
- Improve project delivery times using Last Planner System
- Enable continuous improvement culture through Kaizen events
- Provide real-time AI analysis using multiple AI providers

---

## 🚀 Sprint Completion Summary

### Sprint 1: Core Infrastructure ✅ COMPLETE

#### Implemented Features:

**1. Email & Notification System**

- ✅ Notification settings management (email, Slack, Teams)
- ✅ Notification logging with status tracking
- ✅ Scheduled reports configuration
- ✅ Test notification functionality
- ✅ Waste incident alerts (automated via Inngest)
- ✅ Task deadline reminders (daily cron job)
- ✅ Weekly performance reports (automated)

**2. Calendar & Scheduling**

- ✅ Calendar events API (CRUD operations)
- ✅ Event types: tasks, milestones, kaizen, 5S assessments, meetings
- ✅ Project-based filtering
- ✅ External calendar sync ready (Google Calendar integration available)

**3. Last Planner Tasks**

- ✅ Task management API with full CRUD
- ✅ Status workflow: planned → committed → in_progress → completed/blocked
- ✅ Assignee tracking with team member linkage
- ✅ Priority and dependency management
- ✅ Milestone association

**4. Kaizen Events**

- ✅ Kaizen event management API
- ✅ Problem statement → Root cause → Solution workflow
- ✅ Before/after metrics tracking (JSONB)
- ✅ Participant management
- ✅ Status tracking: proposed → approved → in_progress → completed

**5. Subcontractor Management**

- ✅ Full subcontractor CRUD
- ✅ Compliance status tracking (pending/compliant/non-compliant)
- ✅ Insurance expiry monitoring
- ✅ Performance rating system (5-star)
- ✅ Project assignment with contract value tracking
- ✅ Waste incident attribution per subcontractor

**6. Integrations Hub** (`/dashboard/integrations`)

- ✅ Integration overview with all available services
- ✅ Notification channel configuration (Email, Slack, Teams)
- ✅ Scheduled report management
- ✅ Test notification sending
- ✅ OAuth connection flow ready

**7. Background Jobs (Inngest)**

- ✅ Weekly performance report cron (Mondays 9 AM)
- ✅ Task deadline reminder cron (Daily 8 AM)
- ✅ Waste incident alert trigger (event-based)

---

## AI Integration

### Configured API Keys (Environment Variables)

- `API_KEY_GEMINIAI` - Google Gemini API key
- `API_KEY_OPENAI` - OpenAI API key
- `API_KEY_OPENROUTER` - OpenRouter API key

### AI Providers & Models

| Provider          | Fast (Low)              | Balanced (Medium) | Advanced (High) |
| ----------------- | ----------------------- | ----------------- | --------------- |
| **Google Gemini** | Gemini 2.0 Flash        | Gemini 2.5 Flash  | Gemini 2.5 Pro  |
| **OpenAI**        | GPT-4o Mini             | GPT-4o            | o1-preview      |
| **OpenRouter**    | Gemini 2.0 Flash (Free) | Gemini 2.5 Flash  | Claude Sonnet 4 |

---

## 📊 Available Integrations

| Integration                  | Status       | Features                            |
| ---------------------------- | ------------ | ----------------------------------- |
| **Gmail / Google Workspace** | 🟡 Available | Email notifications, reports        |
| **Microsoft Outlook**        | 🟡 Available | Email, calendar sync                |
| **Google Calendar**          | 🟡 Available | Task sync, milestone tracking       |
| **Slack**                    | 🟡 Available | Real-time alerts, standup summaries |
| **Microsoft Teams**          | 🟡 Available | Notifications, collaboration        |
| **Twilio SendGrid**          | 🟡 Available | Bulk email, transactional           |

---

## Database Schema (New Tables)

```sql
-- Notifications & Communication
notification_settings     -- User notification preferences
scheduled_reports         -- Automated report scheduling
notification_log          -- Notification audit trail

-- Calendar & Scheduling
calendar_events           -- Events, meetings, milestones
last_planner_tasks        -- LPS task management
kaizen_events             -- Continuous improvement events

-- Subcontractor Management
subcontractors            -- Subcontractor registry
project_subcontractors    -- Project assignments

-- Enterprise Features
photo_documents           -- Photo evidence storage
user_permissions          -- Role-based access control
audit_trail               -- Change tracking
```

---

## New API Endpoints

| Endpoint                 | Methods                | Description                               |
| ------------------------ | ---------------------- | ----------------------------------------- |
| `/api/notifications`     | GET, POST, DELETE      | Notification settings & scheduled reports |
| `/api/send-notification` | POST                   | Send email/Slack/Teams notifications      |
| `/api/calendar`          | GET, POST, PUT, DELETE | Calendar event management                 |
| `/api/tasks`             | GET, POST, PUT, DELETE | Last Planner task management              |
| `/api/kaizen`            | GET, POST, PUT, DELETE | Kaizen event management                   |
| `/api/subcontractors`    | GET, POST, PUT, DELETE | Subcontractor management                  |
| `/api/team`              | GET, POST, PUT, DELETE | Team member management                    |

---

## Dashboard Routes

| Module              | Route                        | Status     |
| ------------------- | ---------------------------- | ---------- |
| **Dashboard**       | `/dashboard`                 | ✅ Working |
| **Projects**        | `/dashboard/projects`        | ✅ Working |
| **Waste Incidents** | `/dashboard/waste-incidents` | ✅ Working |
| **Recommendations** | `/dashboard/recommendations` | ✅ Working |
| **AI Assistant**    | `/dashboard/ai-assistant`    | ✅ Working |
| **AI Analysis**     | `/dashboard/ai-analysis`     | ✅ Working |
| **Value Stream**    | `/dashboard/value-stream`    | ✅ Working |
| **Last Planner**    | `/dashboard/last-planner`    | ✅ Working |
| **5S Assessments**  | `/dashboard/5s-assessments`  | ✅ Working |
| **Kaizen**          | `/dashboard/kaizen`          | ✅ Working |
| **Team**            | `/dashboard/team`            | ✅ Working |
| **Subcontractors**  | `/dashboard/subcontractors`  | ✅ NEW     |
| **Reports**         | `/dashboard/reports`         | ✅ Working |
| **Integrations**    | `/dashboard/integrations`    | ✅ NEW     |
| **Settings**        | `/dashboard/settings`        | ✅ Working |

---

## Background Jobs (Inngest)

| Job                       | Schedule        | Function            |
| ------------------------- | --------------- | ------------------- |
| Weekly Performance Report | Monday 9:00 AM  | `weeklyReportCron`  |
| Task Deadline Reminder    | Daily 8:00 AM   | `taskReminderCron`  |
| Waste Incident Alert      | Event-triggered | `wasteAlertTrigger` |

---

## Architecture

### Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **UI**: Shadcn/ui, Tailwind CSS, Lucide icons
- **State**: React hooks, SWR for data fetching
- **Database**: Neon (PostgreSQL)
- **AI**: OpenAI, Google Gemini, OpenRouter
- **Background Jobs**: Inngest
- **Integrations**: Pipedream (Gmail, Google Calendar, Slack, Teams)

### Key Files

```
src/
├── app/
│   ├── api/
│   │   ├── notifications/route.ts    # Notification management
│   │   ├── send-notification/route.ts # Send notifications
│   │   ├── calendar/route.ts         # Calendar events
│   │   ├── tasks/route.ts            # Last Planner tasks
│   │   ├── kaizen/route.ts           # Kaizen events
│   │   ├── subcontractors/route.ts   # Subcontractor management
│   │   └── team/route.ts             # Team member management
│   └── dashboard/
│       ├── integrations/page.tsx     # Integration hub
│       └── subcontractors/page.tsx   # Subcontractor management
├── inngest/
│   └── functions/
│       ├── weekly-report-cron.ts     # Weekly report automation
│       ├── task-reminder-cron.ts     # Task deadline reminders
│       └── waste-alert-trigger.ts    # Waste incident alerts
└── shared/
    └── models/
        └── lean-construction.ts      # All TypeScript models
```

---

## Getting Started

1. Navigate to the landing page (`/`)
2. Click "Get Started" to register or "Login" to sign in
3. Use demo mode for quick access to the dashboard
4. Go to **Settings → API Keys** to configure your AI providers
5. Visit **Integrations** to set up email/Slack notifications
6. Explore the AI Assistant for conversational analysis
7. Try the AI Analysis Engine for structured reports

---

## User Roles

| Role            | Permissions                                   |
| --------------- | --------------------------------------------- |
| Admin           | Full access, user management, system settings |
| Project Manager | Project CRUD, team management, reports        |
| Field Engineer  | Data entry, incident logging, view reports    |
| Viewer          | Read-only access to dashboards and reports    |
