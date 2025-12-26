import { NextResponse } from 'next/server';
import { queryInternalDatabase } from '@/server-lib/internal-db-query';
import { sql } from '@/server-lib/sql-tag';

// GET team members
export async function GET() {
  try {
    const members = await queryInternalDatabase(sql`
      SELECT * FROM team_members ORDER BY name ASC
    `);
    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}

// POST create team member
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, department, skills } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const result = await queryInternalDatabase(sql`
      INSERT INTO team_members (name, email, role, department, skills)
      VALUES (${name}, ${email}, ${role}, ${department}, ${skills})
      RETURNING *
    `);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 });
  }
}

// PUT update team member
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const setClause = Object.keys(updates)
      .map((key, index) => sql`${key} = ${updates[key]}`)
      .reduce((acc, curr) => sql`${acc}, ${curr}`);
    
    const result = await queryInternalDatabase(
      sql`UPDATE team_members SET ${setClause} WHERE id = ${id} RETURNING *`
    );

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
  }
}

// DELETE team member
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await queryInternalDatabase(sql`DELETE FROM team_members WHERE id = ${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 });
  }
}
