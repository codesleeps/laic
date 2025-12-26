import { NextResponse } from 'next/server';
import { queryInternalDatabase } from '@/server-lib/internal-db-query';
import { sql } from '@/server-lib/sql-tag';

export async function GET() {
  try {
    const categories = await queryInternalDatabase(sql`
      SELECT * FROM waste_categories ORDER BY code
    `);

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching waste categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waste categories' },
      { status: 500 }
    );
  }
}
