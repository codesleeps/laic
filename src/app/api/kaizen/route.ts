import { NextResponse } from 'next/server';
import { queryInternalDatabase } from '@/server-lib/internal-db-query';
import { sql } from '@/server-lib/sql-tag';

// GET Kaizen events
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');

    const projectIdFilter = projectId ? sql`AND k.project_id = ${projectId}` : sql``;
    const statusFilter = status ? sql`AND k.status = ${status}` : sql``;

    const query = sql`
      SELECT k.*, p.name as project_name 
      FROM kaizen_events k
      LEFT JOIN projects p ON k.project_id = p.id
      WHERE 1=1
      ${projectIdFilter}
      ${statusFilter}
      ORDER BY k.created_at DESC
    `;

    const events = await queryInternalDatabase(query);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching kaizen events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST create Kaizen event
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      project_id, title, description, problem_statement, root_cause,
      proposed_solution, expected_outcome, status, scheduled_date,
      participants, created_by
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const result = await queryInternalDatabase(sql`
      INSERT INTO kaizen_events 
      (project_id, title, description, problem_statement, root_cause, proposed_solution, expected_outcome, status, scheduled_date, participants, created_by)
      VALUES (${project_id}, ${title}, ${description}, ${problem_statement}, ${root_cause}, ${proposed_solution}, ${expected_outcome}, ${status || 'proposed'}, ${scheduled_date}, ${participants}, ${created_by})
      RETURNING *
    `);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating kaizen event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

// PUT update Kaizen event
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    // Handle completion
    if (updates.status === 'completed' && !updates.completion_date) {
      updates.completion_date = new Date().toISOString().split('T')[0];
    }

    const setClause = Object.keys(updates)
      .map((key) => sql`${key} = ${updates[key]}`)
      .reduce((acc, curr) => sql`${acc}, ${curr}`);
    
    const result = await queryInternalDatabase(
      sql`UPDATE kaizen_events SET ${setClause}, updated_at = NOW() WHERE id = ${id} RETURNING *`
    );

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating kaizen event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// DELETE Kaizen event
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await queryInternalDatabase(sql`DELETE FROM kaizen_events WHERE id = ${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting kaizen event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
