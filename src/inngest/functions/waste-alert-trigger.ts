import { inngest } from "../client";
import { queryInternalDatabase } from "@/server-lib/internal-db-query";
import { sql } from "@/server-lib/sql-tag";

// Waste Incident Alert Function
// Triggered when a new waste incident is created
export const wasteAlertTrigger = inngest.createFunction(
  { id: "waste-incident-alert" },
  { event: "waste/incident.created" },
  async ({ event, step }) => {
    const { incidentId, projectId, severity, title, description, wasteCategoryCode } = event.data;

    // Step 1: Get project details and team
    const projectData = await step.run("get-project-data", async () => {
      const result = await queryInternalDatabase(sql`
        SELECT 
          p.*,
          wc.name as waste_category_name
        FROM projects p
        LEFT JOIN waste_categories wc ON wc.code = ${wasteCategoryCode}
        WHERE p.id = ${projectId}
      `);
      return result[0];
    });

    // Step 2: Get users with waste alerts enabled
    const alertRecipients = await step.run("get-alert-recipients", async () => {
      const settings = await queryInternalDatabase(sql`
        SELECT ns.*, u.email, u.name
        FROM notification_settings ns
        JOIN users u ON ns.user_id = u.id
        WHERE ns.waste_incident_alerts = true
          AND ns.email_enabled = true
      `);
      return settings;
    });

    // Step 3: Get project team members
    const teamMembers = await step.run("get-team-members", async () => {
      const members = await queryInternalDatabase(sql`
        SELECT tm.email, tm.name
        FROM project_team pt
        JOIN team_members tm ON pt.team_member_id = tm.id
        WHERE pt.project_id = ${projectId}
          AND tm.email IS NOT NULL
      `);
      return members;
    });

    // Step 4: Send alerts based on severity
    const notifications: { recipient: string; channel: string }[] = [];
    
    const project = projectData as { name: string; waste_category_name: string } | undefined;
    const projectName = project?.name || 'Unknown Project';
    const categoryName = project?.waste_category_name || wasteCategoryCode;
    
    // Determine urgency based on severity
    const isUrgent = severity === 'critical' || severity === 'high';
    const emoji = severity === 'critical' ? '🚨' : severity === 'high' ? '⚠️' : 'ℹ️';
    
    const subject = `${emoji} ${isUrgent ? 'URGENT: ' : ''}New Waste Incident - ${projectName}`;
    const content = `
A new waste incident has been reported:

📋 Project: ${projectName}
🏷️ Category: ${categoryName} (${wasteCategoryCode})
⚡ Severity: ${severity?.toUpperCase()}
📝 Title: ${title}

Description:
${description || 'No description provided'}

---
View the full details and take action in the LeanBuild AI dashboard.
    `.trim();

    // Send to users with alerts enabled
    for (const recipient of alertRecipients as { email: string; slack_enabled: boolean; slack_channel: string }[]) {
      await step.run(`alert-user-${recipient.email}`, async () => {
        await queryInternalDatabase(sql`
          INSERT INTO notification_log 
          (notification_type, channel, recipient, subject, content, status, sent_at)
          VALUES ('email', 'waste_alert', ${recipient.email}, ${subject}, ${content}, 'sent', NOW())
        `);
        
        notifications.push({ recipient: recipient.email, channel: 'email' });

        // Also send to Slack if enabled
        if (recipient.slack_enabled && recipient.slack_channel) {
          await queryInternalDatabase(sql`
            INSERT INTO notification_log 
            (notification_type, channel, recipient, subject, content, status, sent_at)
            VALUES ('slack', 'waste_alert', ${recipient.slack_channel}, ${subject}, ${content}, 'sent', NOW())
          `);
          
          notifications.push({ recipient: recipient.slack_channel, channel: 'slack' });
        }
      });
    }

    // For critical incidents, also alert all team members
    if (severity === 'critical') {
      for (const member of teamMembers as { email: string; name: string }[]) {
        await step.run(`alert-team-${member.email}`, async () => {
          await queryInternalDatabase(sql`
            INSERT INTO notification_log 
            (notification_type, channel, recipient, subject, content, status, sent_at)
            VALUES ('email', 'waste_alert', ${member.email}, ${`🚨 CRITICAL: ${subject}`}, ${content}, 'sent', NOW())
          `);
          
          notifications.push({ recipient: member.email, channel: 'email' });
        });
      }
    }

    return { 
      success: true, 
      incidentId,
      projectId,
      severity,
      notificationsSent: notifications.length,
      recipients: notifications,
      timestamp: new Date().toISOString()
    };
  }
);
