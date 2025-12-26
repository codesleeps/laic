import { NextResponse } from 'next/server';
import { queryInternalDatabase } from '@/server-lib/internal-db-query';
import { sql } from '@/server-lib/sql-tag';

export async function GET() {
  try {
    const projects = await queryInternalDatabase(sql`
      SELECT * FROM projects ORDER BY created_at DESC
    `);

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, client_name, location, status, start_date, end_date, budget } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    const result = await queryInternalDatabase(sql`
      INSERT INTO projects (name, description, client_name, location, status, start_date, end_date, budget)
      VALUES (${name}, ${description}, ${client_name}, ${location}, ${status || 'planning'}, ${start_date}, ${end_date}, ${budget})
      RETURNING *
    `);

    const created = result[0];
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
