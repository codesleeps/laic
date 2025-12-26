import { inngest } from "../client";
import { queryInternalDatabase } from "@/server-lib/internal-db-query";
import { sql } from "@/server-lib/sql-tag";

// Task Reminder Cron Job
// Runs every day at 8:00 AM to check for upcoming task deadlines
export const taskReminderCron = inngest.createFunction(
  { id: "task-deadline-reminder" },
  { cron: "0 8 * * *" }, // Every day at 8:00 AM
  async ({ step }) => {
    // Step 1: Get tasks due in the next 24 hours
    const upcomingTasks = await step.run("get-upcoming-tasks", async () => {
      const tasks = await queryInternalDatabase(sql`
        SELECT 
          t.*,
          p.name as project_name,
          tm.name as assignee_name,
          tm.email as assignee_email
        FROM last_planner_tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN team_members tm ON t.assigned_to = tm.id
        WHERE t.planned_end BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '1 day'
          AND t.status NOT IN ('completed', 'blocked')
      `);
      return tasks;
    });

    // Step 2: Get overdue tasks
    const overdueTasks = await step.run("get-overdue-tasks", async () => {
      const tasks = await queryInternalDatabase(sql`
        SELECT 
          t.*,
          p.name as project_name,
          tm.name as assignee_name,
          tm.email as assignee_email
        FROM last_planner_tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN team_members tm ON t.assigned_to = tm.id
        WHERE t.planned_end < CURRENT_DATE
          AND t.status NOT IN ('completed')
      `);
      return tasks;
    });

    // Step 3: Get users with task reminders enabled
    const usersWithReminders = await step.run("get-notification-settings", async () => {
      const settings = await queryInternalDatabase(sql`
        SELECT * FROM notification_settings 
        WHERE task_reminders = true 
          AND (email_enabled = true OR slack_enabled = true)
      `);
      return settings;
    });

    // Step 4: Send reminders
    const notifications: { taskId: string; type: string; recipient: string }[] = [];

    // Send upcoming task reminders
    for (const task of upcomingTasks as { id: string; title: string; project_name: string; assignee_email: string | null; planned_end: string }[]) {
      if (task.assignee_email) {
        await step.run(`reminder-upcoming-${task.id}`, async () => {
          await queryInternalDatabase(sql`
            INSERT INTO notification_log 
            (notification_type, channel, recipient, subject, content, status, sent_at)
            VALUES (${'email'}, ${'task_reminder'}, ${task.assignee_email}, ${`⏰ Task Due Tomorrow: ${task.title}`}, ${`Your task "${task.title}" on project "${task.project_name}" is due on ${new Date(task.planned_end).toLocaleDateString()}. Please ensure it's completed on time.`}, 'sent', NOW())
          `);
          
          notifications.push({
            taskId: task.id,
            type: 'upcoming',
            recipient: task.assignee_email ?? 'unknown'
          });
        });
      }
    }

    // Send overdue task alerts
    for (const task of overdueTasks as { id: string; title: string; project_name: string; assignee_email: string | null; planned_end: string }[]) {
      if (task.assignee_email) {
        await step.run(`reminder-overdue-${task.id}`, async () => {
          await queryInternalDatabase(sql`
            INSERT INTO notification_log 
            (notification_type, channel, recipient, subject, content, status, sent_at)
            VALUES (${'email'}, ${'task_reminder'}, ${task.assignee_email}, ${`🚨 OVERDUE Task: ${task.title}`}, ${`Your task "${task.title}" on project "${task.project_name}" was due on ${new Date(task.planned_end).toLocaleDateString()} and is now overdue. Please update the status or contact your project manager.`}, 'sent', NOW())
          `);
          
          notifications.push({
            taskId: task.id,
            type: 'overdue',
            recipient: task.assignee_email ?? 'unknown'
          });
        });
      }
    }

    return { 
      success: true, 
      upcomingTasksCount: upcomingTasks.length,
      overdueTasksCount: overdueTasks.length,
      notificationsSent: notifications.length,
      timestamp: new Date().toISOString()
    };
  }
);
