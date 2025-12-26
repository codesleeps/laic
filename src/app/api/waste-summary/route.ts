import { NextResponse } from 'next/server';
import { queryInternalDatabase } from '@/server-lib/internal-db-query';
import { sql } from '@/server-lib/sql-tag';

export async function GET() {
  try {
    const summary = await queryInternalDatabase(sql`
      SELECT 
        wc.id,
        wc.code,
        wc.name,
        wc.description,
        wc.icon,
        COUNT(wi.id) as incident_count,
        COALESCE(SUM(wi.estimated_cost_impact), 0) as total_cost_impact,
        COALESCE(SUM(wi.estimated_time_impact), 0) as total_time_impact
      FROM waste_categories wc
      LEFT JOIN waste_incidents wi ON wc.id = wi.waste_category_id
      GROUP BY wc.id, wc.code, wc.name, wc.description, wc.icon
      ORDER BY wc.code
    `);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching waste summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waste summary' },
      { status: 500 }
    );
  }
}
