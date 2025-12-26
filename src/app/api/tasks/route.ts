import { NextResponse } from 'next/server';
import { queryInternalDatabase } from '@/server-lib/internal-db-query';
import { sql } from '@/server-lib/sql-tag';

// GET Last Planner tasks
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');

    const projectIdFilter = projectId ? sql`AND t.project_id = ${projectId}` : sql``;
    const statusFilter = status ? sql`AND t.status = ${status}` : sql``;
    const assignedToFilter = assignedTo ? sql`AND t.assigned_to = ${assignedTo}` : sql``;

    const query = sql`
      SELECT t.*, 
        p.name as project_name,
        m.name as milestone_name,
        tm.name as assignee_name,
        tm.email as assignee_email
      FROM last_planner_tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN milestones m ON t.milestone_id = m.id
      LEFT JOIN team_members tm ON t.assigned_to = tm.id
      WHERE 1=1
      ${projectIdFilter}
      ${statusFilter}
      ${assignedToFilter}
      ORDER BY t.planned_start ASC NULLS LAST, t.priority DESC
    `;

    const tasks = await queryInternalDatabase(query);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST create task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      project_id, milestone_id, title, description, assigned_to,
      status, priority, planned_start, planned_end, dependencies
    } = body;

    if (!project_id || !title) {
      return NextResponse.json(
        { error: 'Project ID and title are required' },
        { status: 400 }
      );
    }

    const result = await queryInternalDatabase(sql`
      INSERT INTO last_planner_tasks 
      (project_id, milestone_id, title, description, assigned_to, status, priority, planned_start, planned_end, dependencies)
      VALUES (${project_id}, ${milestone_id}, ${title}, ${description}, ${assigned_to}, ${status || 'planned'}, ${priority || 'medium'}, ${planned_start}, ${planned_end}, ${dependencies})
      RETURNING *
    `);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

// PUT update task
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    // Handle status transitions
    if (updates.status === 'in_progress' && !updates.actual_start) {
      updates.actual_start = new Date().toISOString().split('T')[0];
    }
    if (updates.status === 'completed' && !updates.actual_end) {
      updates.actual_end = new Date().toISOString().split('T')[0];
      updates.percent_complete = 100;
    }

    const setClause = Object.keys(updates)
      .map((key) => sql`${key} = ${updates[key]}`)
      .reduce((acc, curr) => sql`${acc}, ${curr}`);
    
    const result = await queryInternalDatabase(
      sql`UPDATE last_planner_tasks SET ${setClause}, updated_at = NOW() WHERE id = ${id} RETURNING *`
    );

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE task
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await queryInternalDatabase(sql`DELETE FROM last_planner_tasks WHERE id = ${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
