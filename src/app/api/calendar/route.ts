import { NextResponse } from 'next/server';
import { queryInternalDatabase } from '@/server-lib/internal-db-query';
import { sql } from '@/server-lib/sql-tag';

// GET calendar events
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const eventType = searchParams.get('eventType');

    const projectIdFilter = projectId ? sql`AND ce.project_id = ${projectId}` : sql``;
    const startDateFilter = startDate ? sql`AND ce.start_datetime >= ${startDate}` : sql``;
    const endDateFilter = endDate ? sql`AND ce.start_datetime <= ${endDate}` : sql``;
    const eventTypeFilter = eventType ? sql`AND ce.event_type = ${eventType}` : sql``;

    const query = sql`
      SELECT ce.*, p.name as project_name 
      FROM calendar_events ce
      LEFT JOIN projects p ON ce.project_id = p.id
      WHERE 1=1
      ${projectIdFilter}
      ${startDateFilter}
      ${endDateFilter}
      ${eventTypeFilter}
      ORDER BY ce.start_datetime ASC
    `;

    const events = await queryInternalDatabase(query);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST create calendar event
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      project_id, title, description, event_type,
      start_datetime, end_datetime, all_day, location,
      attendees, reminder_minutes, created_by
    } = body;

    if (!title || !event_type || !start_datetime) {
      return NextResponse.json(
        { error: 'Title, event type, and start datetime are required' },
        { status: 400 }
      );
    }

    const result = await queryInternalDatabase(sql`
      INSERT INTO calendar_events 
      (project_id, title, description, event_type, start_datetime, end_datetime, all_day, location, attendees, reminder_minutes, created_by)
      VALUES (${project_id}, ${title}, ${description}, ${event_type}, ${start_datetime}, ${end_datetime}, ${all_day ?? false}, ${location}, ${attendees}, ${reminder_minutes ?? 30}, ${created_by})
      RETURNING *
    `);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

// PUT update calendar event
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const setClause = Object.keys(updates)
      .map((key) => sql`${key} = ${updates[key]}`)
      .reduce((acc, curr) => sql`${acc}, ${curr}`);
    
    const result = await queryInternalDatabase(
      sql`UPDATE calendar_events SET ${setClause}, updated_at = NOW() WHERE id = ${id} RETURNING *`
    );

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// DELETE calendar event
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await queryInternalDatabase(sql`DELETE FROM calendar_events WHERE id = ${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
