import { NextResponse } from 'next/server';
import { queryInternalDatabase } from '@/server-lib/internal-db-query';
import { sql } from '@/server-lib/sql-tag';

export async function GET() {
  try {
    const incidents = await queryInternalDatabase(sql`
      SELECT 
        wi.*,
        wc.code as waste_code,
        wc.name as waste_name,
        wc.icon as waste_icon,
        p.name as project_name
      FROM waste_incidents wi
      JOIN waste_categories wc ON wi.waste_category_id = wc.id
      JOIN projects p ON wi.project_id = p.id
      ORDER BY 
        CASE wi.severity 
          WHEN 'critical' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          ELSE 4 
        END,
        wi.reported_at DESC
    `);

    return NextResponse.json(incidents);
  } catch (error) {
    console.error('Error fetching waste incidents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waste incidents' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      project_id, 
      waste_category_id, 
      title, 
      description, 
      severity,
      estimated_cost_impact,
      estimated_time_impact,
      root_cause,
      reported_by 
    } = body;

    if (!project_id || !waste_category_id || !title) {
      return NextResponse.json(
        { error: 'Project, waste category, and title are required' },
        { status: 400 }
      );
    }

    const result = await queryInternalDatabase(sql`
      INSERT INTO waste_incidents (
        project_id, waste_category_id, title, description, severity,
        estimated_cost_impact, estimated_time_impact, root_cause, reported_by
      )
      VALUES (
        ${project_id}, ${waste_category_id}, ${title}, ${description}, ${severity || 'medium'},
        ${estimated_cost_impact}, ${estimated_time_impact}, ${root_cause}, ${reported_by}
      )
      RETURNING *
    `);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating waste incident:', error);
    return NextResponse.json(
      { error: 'Failed to create waste incident' },
      { status: 500 }
    );
  }
}
