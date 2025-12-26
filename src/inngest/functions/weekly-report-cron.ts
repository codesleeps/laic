import { inngest } from "../client";
import { queryInternalDatabase } from "@/server-lib/internal-db-query";
import { sql } from "@/server-lib/sql-tag";

// Weekly Performance Report Cron Job
// Runs every Monday at 9:00 AM
export const weeklyReportCron = inngest.createFunction(
  { id: "weekly-performance-report" },
  { cron: "0 9 * * 1" }, // Every Monday at 9:00 AM
  async ({ step }) => {
    // Step 1: Get all scheduled weekly reports
    const scheduledReports = await step.run("get-scheduled-reports", async () => {
      const reports = await queryInternalDatabase(sql`
        SELECT sr.*, p.name as project_name 
        FROM scheduled_reports sr
        LEFT JOIN projects p ON sr.project_id = p.id
        WHERE sr.frequency = 'weekly' 
          AND sr.is_active = true
          AND sr.report_type = 'weekly_performance'
      `);
      return reports;
    });

    // Step 2: For each scheduled report, generate and send
    for (const report of scheduledReports as { id: string; project_id: string | null; project_name: string | null; email_recipients: string[] | null }[]) {
      await step.run(`generate-report-${report.id}`, async () => {
        // Get project data
        const projectFilter = report.project_id 
          ? sql`WHERE p.id = '${report.project_id}'` 
          : sql``;
        
        const projectData = await queryInternalDatabase(sql`
          SELECT 
            p.*,
            COUNT(DISTINCT wi.id) as waste_incident_count,
            COALESCE(SUM(wi.estimated_cost_impact), 0) as total_waste_cost,
            COALESCE(AVG(phm.overall_health_score), 0) as avg_health_score
          FROM projects p
          LEFT JOIN waste_incidents wi ON p.id = wi.project_id 
            AND wi.reported_at >= NOW() - INTERVAL '7 days'
          LEFT JOIN project_health_metrics phm ON p.id = phm.project_id
            AND phm.metric_date >= NOW() - INTERVAL '7 days'
          ${projectFilter}
          GROUP BY p.id
        `);

        // Get recommendations generated this week
        const recommendations = await queryInternalDatabase(sql`
          SELECT COUNT(*) as count, 
                 SUM(potential_savings) as total_savings
          FROM recommendations 
          WHERE created_at >= NOW() - INTERVAL '7 days'
          ${report.project_id ? sql`AND project_id = '${report.project_id}'` : sql``}
        `);

        // Generate report content
        const reportContent = generateWeeklyReportContent(
          projectData as { name: string; waste_incident_count: number; total_waste_cost: number; avg_health_score: number }[],
          recommendations as { count: number; total_savings: number }[],
          report.project_name
        );

        // Log the notification (would send via integration in production)
        if (report.email_recipients && report.email_recipients.length > 0) {
          await queryInternalDatabase(sql`
            INSERT INTO notification_log 
            (notification_type, channel, recipient, subject, content, status, sent_at)
            VALUES (${'email'}, ${'weekly_report'}, ${report.email_recipients.join(', ')}, ${`Weekly Performance Report${report.project_name ? ` - ${report.project_name}` : ''}`}, ${reportContent}, 'sent', NOW())
          `);
        }

        // Update last_sent_at
        await queryInternalDatabase(sql`
          UPDATE scheduled_reports 
          SET last_sent_at = NOW(), 
              next_send_at = NOW() + INTERVAL '7 days'
          WHERE id = ${report.id}
        `);

        return { success: true, reportId: report.id };
      });
    }

    return { 
      success: true, 
      reportsProcessed: scheduledReports.length,
      timestamp: new Date().toISOString()
    };
  }
);

function generateWeeklyReportContent(
  projects: { name: string; waste_incident_count: number; total_waste_cost: number; avg_health_score: number }[],
  recommendations: { count: number; total_savings: number }[],
  projectName: string | null
): string {
  const totalIncidents = projects.reduce((sum, p) => sum + Number(p.waste_incident_count), 0);
  const totalWasteCost = projects.reduce((sum, p) => sum + Number(p.total_waste_cost), 0);
  const avgHealth = projects.length > 0 
    ? projects.reduce((sum, p) => sum + Number(p.avg_health_score), 0) / projects.length 
    : 0;
  const recCount = recommendations[0]?.count || 0;
  const potentialSavings = recommendations[0]?.total_savings || 0;

  return `
📊 WEEKLY PERFORMANCE REPORT
${projectName ? `Project: ${projectName}` : 'All Projects'}
Generated: ${new Date().toLocaleDateString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏗️ PROJECT OVERVIEW
• Active Projects: ${projects.length}
• Average Health Score: ${avgHealth.toFixed(1)}%

⚠️ WASTE INCIDENTS (Last 7 Days)
• New Incidents: ${totalIncidents}
• Estimated Cost Impact: $${totalWasteCost.toLocaleString()}

💡 AI RECOMMENDATIONS
• New Recommendations: ${recCount}
• Potential Savings: $${Number(potentialSavings).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 PROJECT BREAKDOWN
${projects.map(p => `
• ${p.name}
  - Health Score: ${Number(p.avg_health_score).toFixed(1)}%
  - Waste Incidents: ${p.waste_incident_count}
  - Cost Impact: $${Number(p.total_waste_cost).toLocaleString()}
`).join('')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 RECOMMENDATIONS
Review your AI-generated recommendations in the dashboard
to identify cost-saving opportunities.

---
LeanBuild AI - Lean Construction Management Platform
  `.trim();
}
