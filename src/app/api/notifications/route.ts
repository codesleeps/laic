import { NextResponse } from 'next/server';
import { queryInternalDatabase } from '@/server-lib/internal-db-query';
import { sql } from '@/server-lib/sql-tag';

// GET notification settings and logs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'settings';
    const userId = searchParams.get('userId');
    const userIdFilter = userId ? sql`WHERE user_id = ${userId}` : sql``;
    if (type === 'settings') {
      const settings = await queryInternalDatabase(sql`
        SELECT * FROM notification_settings 
        ${userIdFilter} 
        ORDER BY created_at DESC
      `);
      return NextResponse.json(settings);
    }

    if (type === 'logs') {
      const logs = await queryInternalDatabase(sql`
        SELECT * FROM notification_log 
        ${userIdFilter} 
        ORDER BY created_at DESC 
        LIMIT 100
      `);
      return NextResponse.json(logs);
    }

    if (type === 'scheduled') {
      const scheduled = await queryInternalDatabase(sql`
        SELECT sr.*, p.name as project_name 
        FROM scheduled_reports sr
        LEFT JOIN projects p ON sr.project_id = p.id
        ${userId ? sql`WHERE sr.user_id = ${userId}` : sql``} 
        ORDER BY sr.created_at DESC
      `);
      return NextResponse.json(scheduled);
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST create/update notification settings or schedule a report
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === 'settings') {
      const { 
        user_id, email_enabled, slack_enabled, teams_enabled,
        email_address, slack_channel, teams_channel,
        waste_incident_alerts, task_reminders, weekly_reports, daily_standups 
      } = body;

      // Upsert notification settings
      const existing = await queryInternalDatabase(
        sql`SELECT id FROM notification_settings WHERE user_id = ${user_id}`
      );

      if (existing.length > 0) {
        const result = await queryInternalDatabase(sql`
          UPDATE notification_settings SET
            email_enabled = ${email_enabled}, slack_enabled = ${slack_enabled}, teams_enabled = ${teams_enabled},
            email_address = ${email_address}, slack_channel = ${slack_channel}, teams_channel = ${teams_channel},
            waste_incident_alerts = ${waste_incident_alerts}, task_reminders = ${task_reminders}, weekly_reports = ${weekly_reports}, daily_standups = ${daily_standups},
            updated_at = NOW()
          WHERE user_id = ${user_id}
          RETURNING *
        `);
        return NextResponse.json(result[0]);
      }

      const result = await queryInternalDatabase(sql`
        INSERT INTO notification_settings 
        (user_id, email_enabled, slack_enabled, teams_enabled, email_address, slack_channel, teams_channel,
         waste_incident_alerts, task_reminders, weekly_reports, daily_standups)
        VALUES (${user_id}, ${email_enabled ?? true}, ${slack_enabled ?? false}, ${teams_enabled ?? false}, ${email_address}, ${slack_channel}, ${teams_channel},
         ${waste_incident_alerts ?? true}, ${task_reminders ?? true}, ${weekly_reports ?? true}, ${daily_standups ?? false})
        RETURNING *
      `);
      return NextResponse.json(result[0], { status: 201 });
    }

    if (type === 'scheduled_report') {
      const {
        user_id, project_id, report_type, frequency,
        day_of_week, day_of_month, time_of_day, email_recipients, slack_channels
      } = body;

      const result = await queryInternalDatabase(sql`
        INSERT INTO scheduled_reports 
        (user_id, project_id, report_type, frequency, day_of_week, day_of_month, time_of_day, email_recipients, slack_channels)
        VALUES (${user_id}, ${project_id}, ${report_type}, ${frequency}, ${day_of_week}, ${day_of_month}, ${time_of_day || '09:00:00'}, ${email_recipients}, ${slack_channels})
        RETURNING *
      `);
      return NextResponse.json(result[0], { status: 201 });
    }

    if (type === 'log') {
      const { user_id, notification_type, channel, recipient, subject, content, status } = body;
      
      const result = await queryInternalDatabase(sql`
        INSERT INTO notification_log (user_id, notification_type, channel, recipient, subject, content, status)
        VALUES (${user_id}, ${notification_type}, ${channel}, ${recipient}, ${subject}, ${content}, ${status || 'pending'})
        RETURNING *
      `);
      return NextResponse.json(result[0], { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

// DELETE scheduled report
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await queryInternalDatabase(sql`DELETE FROM scheduled_reports WHERE id = ${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting scheduled report:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
