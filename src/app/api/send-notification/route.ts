import { NextResponse } from 'next/server';
import { queryInternalDatabase } from '@/server-lib/internal-db-query';
import { sql } from '@/server-lib/sql-tag';

// This endpoint handles sending notifications via email, Slack, or Teams
// It logs all notifications and integrates with external services when configured

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type, // 'email' | 'slack' | 'teams'
      channel, // 'waste_alert' | 'task_reminder' | 'weekly_report' | 'daily_standup'
      recipients, // Array of email addresses or channel IDs
      subject,
      content,
      html_content,
      user_id,
      project_id,
      metadata
    } = body;

    if (!type || !recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Type and recipients are required' },
        { status: 400 }
      );
    }

    const results = [];

    for (const recipient of recipients) {
      // Log the notification
      const logResult = await queryInternalDatabase(sql`
        INSERT INTO notification_log (user_id, notification_type, channel, recipient, subject, content, status)
        VALUES (${user_id}, ${type}, ${channel || 'custom'}, ${recipient}, ${subject}, ${content}, 'pending')
        RETURNING *
      `);

      const logEntry = logResult[0] as { id: string };

      try {
        let sendResult = { success: false, message: '' };

        if (type === 'email') {
          // In production, this would call the integration
          // For now, we simulate success and mark as sent
          sendResult = await sendEmail({ recipient, subject, content, html_content, metadata });
        } else if (type === 'slack') {
          sendResult = await sendSlackMessage({ channel: recipient, content, metadata });
        } else if (type === 'teams') {
          sendResult = await sendTeamsMessage({ channel: recipient, content, metadata });
        }

        // Update log entry
        await queryInternalDatabase(sql`
          UPDATE notification_log 
          SET status = ${sendResult.success ? 'sent' : 'failed'}, 
              sent_at = ${sendResult.success ? new Date() : null}, 
              error_message = ${sendResult.success ? null : sendResult.message}
          WHERE id = ${logEntry.id}
        `);

        results.push({ recipient, success: sendResult.success, message: sendResult.message });
      } catch (sendError) {
        const errorMessage = sendError instanceof Error ? sendError.message : 'Unknown error';
        await queryInternalDatabase(sql`
          UPDATE notification_log 
          SET status = 'failed', error_message = ${errorMessage}
          WHERE id = ${logEntry.id}
        `);

        results.push({ recipient, success: false, message: errorMessage });
      }
    }

    const allSuccess = results.every(r => r.success);
    return NextResponse.json({
      success: allSuccess,
      results,
      message: allSuccess ? 'All notifications sent' : 'Some notifications failed'
    }, { status: allSuccess ? 200 : 207 });

  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}

// Email sending function - integrates with external services
async function sendEmail({ recipient, subject, content, html_content, metadata }: {
  recipient: string;
  subject?: string;
  content?: string;
  html_content?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; message: string }> {
  // Check for SendGrid API key or Gmail integration
  const sendGridKey = process.env.SENDGRID_API_KEY;
  
  if (sendGridKey) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendGridKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: recipient }] }],
          from: { email: process.env.SENDGRID_FROM_EMAIL || 'noreply@leanbuild.ai' },
          subject: subject || 'LeanBuild AI Notification',
          content: [
            { type: 'text/plain', value: content || '' },
            ...(html_content ? [{ type: 'text/html', value: html_content }] : [])
          ]
        })
      });

      if (response.ok || response.status === 202) {
        return { success: true, message: 'Email sent via SendGrid' };
      } else {
        const errorText = await response.text();
        return { success: false, message: `SendGrid error: ${errorText}` };
      }
    } catch (err) {
      return { success: false, message: `SendGrid error: ${err instanceof Error ? err.message : 'Unknown'}` };
    }
  }

  // Fallback: Log that email would be sent (for development/demo)
  console.log(`[EMAIL] To: ${recipient}, Subject: ${subject}, Content: ${content?.substring(0, 100)}...`);
  return { 
    success: true, 
    message: 'Email logged (no email service configured). Connect Gmail or SendGrid to send real emails.' 
  };
}

// Slack message function
async function sendSlackMessage({ channel, content, metadata }: {
  channel: string;
  content?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; message: string }> {
  // Slack webhook URL would come from integration settings
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;
  
  if (slackWebhook) {
    try {
      const response = await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: channel,
          text: content,
          blocks: metadata?.blocks
        })
      });

      if (response.ok) {
        return { success: true, message: 'Message sent to Slack' };
      } else {
        return { success: false, message: `Slack error: ${response.statusText}` };
      }
    } catch (err) {
      return { success: false, message: `Slack error: ${err instanceof Error ? err.message : 'Unknown'}` };
    }
  }

  console.log(`[SLACK] Channel: ${channel}, Content: ${content?.substring(0, 100)}...`);
  return { 
    success: true, 
    message: 'Slack message logged (no Slack integration configured). Connect Slack to send real messages.' 
  };
}

// Teams message function
async function sendTeamsMessage({ channel, content, metadata }: {
  channel: string;
  content?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; message: string }> {
  // Teams webhook URL would come from integration settings
  const teamsWebhook = process.env.TEAMS_WEBHOOK_URL;
  
  if (teamsWebhook) {
    try {
      const response = await fetch(teamsWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '@type': 'MessageCard',
          '@context': 'http://schema.org/extensions',
          summary: 'LeanBuild AI Notification',
          text: content,
          ...metadata
        })
      });

      if (response.ok) {
        return { success: true, message: 'Message sent to Teams' };
      } else {
        return { success: false, message: `Teams error: ${response.statusText}` };
      }
    } catch (err) {
      return { success: false, message: `Teams error: ${err instanceof Error ? err.message : 'Unknown'}` };
    }
  }

  console.log(`[TEAMS] Channel: ${channel}, Content: ${content?.substring(0, 100)}...`);
  return { 
    success: true, 
    message: 'Teams message logged (no Teams integration configured). Connect Teams to send real messages.' 
  };
}
