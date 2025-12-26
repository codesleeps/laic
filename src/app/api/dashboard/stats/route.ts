import { NextResponse } from 'next/server';
import { queryInternalDatabase } from '@/server-lib/internal-db-query';
import { sql } from '@/server-lib/sql-tag';
import type { DashboardStats } from '@/shared/models/lean-construction';

export async function GET() {
  try {
    // Get project stats
    const projectStats = await queryInternalDatabase(sql`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(*) FILTER (WHERE status = 'active') as active_projects,
        COALESCE(SUM(budget), 0) as total_budget,
        COALESCE(SUM(actual_cost), 0) as actual_spend
      FROM projects
    `);

    // Get waste incidents stats
    const wasteStats = await queryInternalDatabase(sql`
      SELECT COUNT(*) as open_incidents
      FROM waste_incidents
      WHERE status IN ('open', 'in_progress')
    `);

    // Get recommendations stats
    const recStats = await queryInternalDatabase(sql`
      SELECT 
        COUNT(*) as pending_recommendations,
        COALESCE(SUM(potential_savings), 0) as potential_savings
      FROM recommendations
      WHERE status = 'pending'
    `);

    // Get average health score
    const healthStats = await queryInternalDatabase(sql`
      SELECT COALESCE(AVG(overall_health_score), 0) as avg_health
      FROM project_health_metrics
      WHERE metric_date = (SELECT MAX(metric_date) FROM project_health_metrics)
    `);

    const stats: DashboardStats = {
      totalProjects: Number(projectStats[0]?.total_projects ?? 0),
      activeProjects: Number(projectStats[0]?.active_projects ?? 0),
      totalBudget: Number(projectStats[0]?.total_budget ?? 0),
      actualSpend: Number(projectStats[0]?.actual_spend ?? 0),
      openWasteIncidents: Number(wasteStats[0]?.open_incidents ?? 0),
      pendingRecommendations: Number(recStats[0]?.pending_recommendations ?? 0),
      potentialSavings: Number(recStats[0]?.potential_savings ?? 0),
      avgHealthScore: Number(healthStats[0]?.avg_health ?? 0),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
