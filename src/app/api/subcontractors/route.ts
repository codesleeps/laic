import { NextResponse } from 'next/server';
import { queryInternalDatabase } from '@/server-lib/internal-db-query';
import { sql } from '@/server-lib/sql-tag';

// GET subcontractors
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const complianceStatus = searchParams.get('complianceStatus');

    if (projectId) {
      // Get subcontractors for a specific project
      const result = await queryInternalDatabase(sql`
        SELECT s.*, ps.role, ps.contract_value, ps.start_date, ps.end_date, 
               ps.performance_rating, ps.waste_incidents_count,
               p.name as project_name
        FROM subcontractors s
        JOIN project_subcontractors ps ON s.id = ps.subcontractor_id
        JOIN projects p ON ps.project_id = p.id
        WHERE ps.project_id = ${projectId}
        ORDER BY s.name ASC
      `);
      return NextResponse.json(result);
    }

    // Get all subcontractors
    const complianceFilter = complianceStatus ? sql`AND compliance_status = ${complianceStatus}` : sql``;
    const query = sql`SELECT * FROM subcontractors WHERE 1=1 ${complianceFilter} ORDER BY name ASC`;

    const result = await queryInternalDatabase(query);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching subcontractors:', error);
    return NextResponse.json({ error: 'Failed to fetch subcontractors' }, { status: 500 });
  }
}

// POST create subcontractor or assign to project
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === 'assign') {
      // Assign subcontractor to project
      const { project_id, subcontractor_id, role, contract_value, start_date, end_date } = body;

      if (!project_id || !subcontractor_id) {
        return NextResponse.json(
          { error: 'Project ID and Subcontractor ID are required' },
          { status: 400 }
        );
      }

      const result = await queryInternalDatabase(sql`
        INSERT INTO project_subcontractors 
        (project_id, subcontractor_id, role, contract_value, start_date, end_date)
        VALUES (${project_id}, ${subcontractor_id}, ${role}, ${contract_value}, ${start_date}, ${end_date})
        ON CONFLICT (project_id, subcontractor_id) 
        DO UPDATE SET role = ${role}, contract_value = ${contract_value}, start_date = ${start_date}, end_date = ${end_date}
        RETURNING *
      `);

      return NextResponse.json(result[0], { status: 201 });
    }

    // Create new subcontractor
    const {
      name, contact_name, email, phone, specialty,
      compliance_status, insurance_expiry, license_number, notes
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const result = await queryInternalDatabase(sql`
      INSERT INTO subcontractors 
      (name, contact_name, email, phone, specialty, compliance_status, insurance_expiry, license_number, notes)
      VALUES (${name}, ${contact_name}, ${email}, ${phone}, ${specialty}, ${compliance_status || 'pending'}, ${insurance_expiry}, ${license_number}, ${notes})
      RETURNING *
    `);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating subcontractor:', error);
    return NextResponse.json({ error: 'Failed to create subcontractor' }, { status: 500 });
  }
}

// PUT update subcontractor
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, type, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    if (type === 'rating') {
      // Update performance rating for project assignment
      const { project_id, performance_rating } = updates;
      const result = await queryInternalDatabase(sql`
        UPDATE project_subcontractors 
        SET performance_rating = ${performance_rating}
        WHERE project_id = ${project_id} AND subcontractor_id = ${id}
        RETURNING *
      `);
      return NextResponse.json(result[0]);
    }

    // Update subcontractor details
    const setClause = Object.keys(updates)
      .map((key) => sql`${key} = ${updates[key]}`)
      .reduce((acc, curr) => sql`${acc}, ${curr}`);
    
    const result = await queryInternalDatabase(
      sql`UPDATE subcontractors SET ${setClause}, updated_at = NOW() WHERE id = ${id} RETURNING *`
    );

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating subcontractor:', error);
    return NextResponse.json({ error: 'Failed to update subcontractor' }, { status: 500 });
  }
}

// DELETE subcontractor or remove from project
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const projectId = searchParams.get('projectId');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    if (projectId) {
      // Remove from project
      await queryInternalDatabase(
        sql`DELETE FROM project_subcontractors WHERE subcontractor_id = ${id} AND project_id = ${projectId}`
      );
    } else {
      // Delete subcontractor entirely
      await queryInternalDatabase(sql`DELETE FROM subcontractors WHERE id = ${id}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subcontractor:', error);
    return NextResponse.json({ error: 'Failed to delete subcontractor' }, { status: 500 });
  }
}
