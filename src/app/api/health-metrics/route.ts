import { NextResponse } from 'next/server';
import { queryInternalDatabase } from '@/server-lib/internal-db-query';
import { sql } from '@/server-lib/sql-tag';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const daysParam = searchParams.get('days');
    const days = Math.min(Math.max(parseInt(daysParam || '7', 10) || 7, 1), 365);

    const projectIdFilter = projectId ? sql`AND phm.project_id = ${projectId}` : sql``;

    const query = sql`
      SELECT 
        phm.*,
        p.name as project_name
      FROM project_health_metrics phm
      JOIN projects p ON phm.project_id = p.id
      WHERE phm.metric_date >= CURRENT_DATE - INTERVAL '1 day' * ${days}
      ${projectIdFilter}
      ORDER BY phm.metric_date DESC, p.name
    `;

    const metrics = await queryInternalDatabase(query);

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching health metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch health metrics' },
      { status: 500 }
    );
  }
}
