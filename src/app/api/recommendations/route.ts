import { NextResponse } from 'next/server';
import { queryInternalDatabase } from '@/server-lib/internal-db-query';
import { sql } from '@/server-lib/sql-tag';

export async function GET() {
  try {
    const recommendations = await queryInternalDatabase(sql`
      SELECT 
        r.*,
        p.name as project_name
      FROM recommendations r
      JOIN projects p ON r.project_id = p.id
      ORDER BY 
        CASE r.priority 
          WHEN 'critical' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          ELSE 4 
        END,
        r.created_at DESC
    `);

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      );
    }

    const implemented_at = status === 'implemented' ? sql`CURRENT_TIMESTAMP` : null;

    const result = await queryInternalDatabase(sql`
      UPDATE recommendations 
      SET status = ${status}, implemented_at = ${implemented_at}
      WHERE id = ${id}
      RETURNING *
    `);

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to update recommendation' },
      { status: 500 }
    );
  }
}
