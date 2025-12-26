"use client";

import { 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  DollarSign, 
  Activity,
  ArrowRight,
  BarChart3,
  Target,
  Zap,
  Shield,
  Clock,
  ChevronRight,
  Sparkles,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  useDashboardStats, 
  useProjects, 
  useWasteSummary, 
  useRecommendations,
  useWasteIncidents,
  type WasteIncidentWithDetails,
  type WasteSummaryItem,
  type RecommendationWithProject
} from "@/client-lib/api-client";
import type { Project, DashboardStats } from "@/shared/models/lean-construction";

// Format currency
function formatCurrency(amount: number | null | undefined): string {
  const safeAmount = Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safeAmount);
}

// Format number with suffix
function formatNumber(num: number | null | undefined): string {
  const safeNum = Number(num) || 0;
  if (safeNum >= 1000000) {
    return (safeNum / 1000000).toFixed(1) + 'M';
  }
  if (safeNum >= 1000) {
    return (safeNum / 1000).toFixed(1) + 'K';
  }
  return safeNum.toString();
}

// Get status color class with fallback
function getStatusColor(status: string | undefined): string {
  const colors: Record<string, string> = {
    planning: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    on_hold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };
  return colors[status ?? ''] ?? colors.planning;
}

// Get severity color class with fallback
function getSeverityColor(severity: string | undefined): string {
  const colors: Record<string, string> = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };
  return colors[severity ?? ''] ?? colors.medium;
}

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = "primary" 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  icon: React.ElementType;
  color?: "primary" | "success" | "warning" | "danger";
}) {
  const colorClasses = {
    primary: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    success: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
    warning: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    danger: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// DOWNTIME Waste Card
function WasteCard({ waste }: { waste: WasteSummaryItem }) {
  const count = Number(waste.incident_count) || 0;
  const costImpact = Number(waste.total_cost_impact) || 0;
  const hasIssues = count > 0;
  
  return (
    <div className={`p-3 rounded-lg border transition-all ${
      hasIssues 
        ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900' 
        : 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${hasIssues ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
            {waste.code}
          </span>
          <span className="text-sm font-medium truncate">{waste.name}</span>
        </div>
        {hasIssues ? (
          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-700">
            {count}
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700">
            ✓
          </Badge>
        )}
      </div>
      {hasIssues && costImpact > 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
          Impact: {formatCurrency(costImpact)}
        </p>
      )}
    </div>
  );
}

// Loading skeleton for cards
function LoadingSkeleton({ count = 3, height = "h-24" }: { count?: number; height?: string }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${height} bg-muted animate-pulse rounded-lg`} />
      ))}
    </div>
  );
}

// Project Card Component
function ProjectCard({ project }: { project: Project }) {
  const progress = Number(project.progress_percentage) || 0;
  const budget = Number(project.budget) || 0;
  const actualCost = Number(project.actual_cost) || 0;

  return (
    <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold">{project.name || 'Unnamed Project'}</h4>
          <p className="text-sm text-muted-foreground">
            {project.client_name || 'Unknown Client'} • {project.location || 'Unknown Location'}
          </p>
        </div>
        <Badge className={getStatusColor(project.status)}>
          {project.status || 'unknown'}
        </Badge>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{progress.toFixed(0)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Budget: {formatCurrency(budget)}</span>
          <span>Spent: {formatCurrency(actualCost)}</span>
        </div>
      </div>
    </div>
  );
}

// Recommendation Card Component
function RecommendationCard({ rec }: { rec: RecommendationWithProject }) {
  const savings = Number(rec.potential_savings) || 0;
  const confidence = Number(rec.ai_confidence) || 0;

  return (
    <div className="p-3 rounded-lg border hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{rec.title || 'Untitled'}</h4>
          <p className="text-xs text-muted-foreground">{rec.project_name || 'Unknown Project'}</p>
        </div>
        <Badge className={getSeverityColor(rec.priority)} variant="outline">
          {rec.priority || 'medium'}
        </Badge>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{rec.category || 'General'}</span>
        <div className="flex items-center gap-3">
          {savings > 0 && (
            <span className="text-green-600 font-medium">
              +{formatCurrency(savings)}
            </span>
          )}
          {confidence > 0 && (
            <span className="text-muted-foreground">
              {confidence.toFixed(0)}% confidence
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Incident Card Component
function IncidentCard({ incident }: { incident: WasteIncidentWithDetails }) {
  const costImpact = Number(incident.estimated_cost_impact) || 0;
  const timeImpact = Number(incident.estimated_time_impact) || 0;

  return (
    <div className="p-3 rounded-lg border hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {incident.waste_code || '?'}
            </Badge>
            <h4 className="font-medium text-sm truncate">{incident.title || 'Untitled'}</h4>
          </div>
          <p className="text-xs text-muted-foreground">{incident.project_name || 'Unknown Project'}</p>
        </div>
        <Badge className={getSeverityColor(incident.severity)} variant="outline">
          {incident.severity || 'medium'}
        </Badge>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{incident.waste_name || 'Unknown'}</span>
        <div className="flex items-center gap-3">
          {costImpact > 0 && (
            <span className="text-red-600">
              -{formatCurrency(costImpact)}
            </span>
          )}
          {timeImpact > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeImpact}h
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects();
  const { data: wasteSummary, isLoading: wasteLoading, error: wasteError } = useWasteSummary();
  const { data: recommendations, isLoading: recsLoading, error: recsError } = useRecommendations();
  const { data: incidents, isLoading: incidentsLoading, error: incidentsError } = useWasteIncidents();

  // Safe data access
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeWasteSummary = Array.isArray(wasteSummary) ? wasteSummary : [];
  const safeRecommendations = Array.isArray(recommendations) ? recommendations : [];
  const safeIncidents = Array.isArray(incidents) ? incidents : [];

  const activeProjects = safeProjects.filter(p => p?.status === 'active');
  const pendingRecs = safeRecommendations.filter(r => r?.status === 'pending');
  const openIncidents = safeIncidents.filter(i => i?.status === 'open' || i?.status === 'in_progress');

  // Safe stats access
  const safeStats: DashboardStats = {
    totalProjects: Number(stats?.totalProjects) || 0,
    activeProjects: Number(stats?.activeProjects) || 0,
    totalBudget: Number(stats?.totalBudget) || 0,
    actualSpend: Number(stats?.actualSpend) || 0,
    openWasteIncidents: Number(stats?.openWasteIncidents) || 0,
    pendingRecommendations: Number(stats?.pendingRecommendations) || 0,
    potentialSavings: Number(stats?.potentialSavings) || 0,
    avgHealthScore: Number(stats?.avgHealthScore) || 0,
  };

  // Check for any critical errors
  const hasError = statsError || projectsError || wasteError || recsError || incidentsError;

  // Loading state
  const isInitialLoading = statsLoading && projectsLoading && wasteLoading;

  if (isInitialLoading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-screen">
      {/* Error Banner */}
      {hasError && (
        <div className="bg-red-50 dark:bg-red-950 border-b border-red-200 dark:border-red-900 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-600 dark:text-red-400">
              Some data failed to load. Displaying available information.
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="text-red-600 dark:text-red-400"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <section className="mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                AI-Powered Dashboard
              </Badge>
            </div>
            <h1 className="text-3xl font-bold">
              Lean Construction Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time project insights and AI-powered recommendations
            </p>
          </div>
          
          {/* Quick Stats Summary */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-blue-50 dark:bg-blue-950 rounded-xl px-4 py-3 text-center min-w-[100px]">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {statsLoading ? '-' : safeStats.activeProjects}
              </p>
              <p className="text-xs text-muted-foreground">Active Projects</p>
            </div>
            <div className="bg-green-50 dark:bg-green-950 rounded-xl px-4 py-3 text-center min-w-[100px]">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {statsLoading ? '-' : `${safeStats.avgHealthScore.toFixed(0)}%`}
              </p>
              <p className="text-xs text-muted-foreground">Health Score</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950 rounded-xl px-4 py-3 text-center min-w-[100px]">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {statsLoading ? '-' : safeStats.openWasteIncidents}
              </p>
              <p className="text-xs text-muted-foreground">Open Issues</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Budget" 
          value={formatCurrency(safeStats.totalBudget)}
          subtitle={`${formatCurrency(safeStats.actualSpend)} spent`}
          icon={DollarSign}
          color="primary"
        />
        <StatCard 
          title="Projects" 
          value={safeStats.totalProjects}
          subtitle={`${safeStats.activeProjects} active`}
          icon={Building2}
          color="success"
        />
        <StatCard 
          title="Open Issues" 
          value={safeStats.openWasteIncidents}
          subtitle="Waste incidents tracked"
          icon={AlertTriangle}
          color="warning"
        />
        <StatCard 
          title="AI Recommendations" 
          value={safeStats.pendingRecommendations}
          subtitle={`${formatCurrency(safeStats.potentialSavings)} savings potential`}
          icon={Lightbulb}
          color="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* DOWNTIME Waste Tracker */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  DOWNTIME Waste Tracker
                </CardTitle>
                <CardDescription>8 Types of Construction Waste</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {wasteLoading ? (
              <LoadingSkeleton count={8} height="h-12" />
            ) : safeWasteSummary.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No waste data available</p>
            ) : (
              safeWasteSummary.map((waste) => (
                <WasteCard key={waste.id} waste={waste} />
              ))
            )}
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  Active Projects
                </CardTitle>
                <CardDescription>Real-time project status and health</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <LoadingSkeleton count={3} />
            ) : activeProjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active projects</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeProjects.slice(0, 4).map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* AI Recommendations */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  AI Recommendations
                </CardTitle>
                <CardDescription>Suggested improvements from AI analysis</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recsLoading ? (
              <LoadingSkeleton count={3} height="h-20" />
            ) : pendingRecs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No pending recommendations</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRecs.slice(0, 4).map((rec) => (
                  <RecommendationCard key={rec.id} rec={rec} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Waste Incidents */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Recent Waste Incidents
                </CardTitle>
                <CardDescription>Latest identified waste events</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {incidentsLoading ? (
              <LoadingSkeleton count={3} height="h-20" />
            ) : openIncidents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No open incidents</p>
              </div>
            ) : (
              <div className="space-y-3">
                {openIncidents.slice(0, 4).map((incident) => (
                  <IncidentCard key={incident.id} incident={incident} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lean Principles Section */}
      <section className="mb-6">
        <h2 className="text-xl font-bold mb-4">Lean Construction Toolkit</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Value Stream Mapping</h3>
              <p className="text-sm text-muted-foreground">
                Visualize and optimize your construction process flow
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="p-3 bg-green-100 dark:bg-green-950 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">5S Assessment</h3>
              <p className="text-sm text-muted-foreground">
                Workplace organization for efficiency and safety
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="p-3 bg-purple-100 dark:bg-purple-950 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">Last Planner System</h3>
              <p className="text-sm text-muted-foreground">
                Collaborative scheduling and planning optimization
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="p-3 bg-orange-100 dark:bg-orange-950 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold mb-2">Kaizen Events</h3>
              <p className="text-sm text-muted-foreground">
                Continuous improvement initiatives and tracking
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-3">Ready to Optimize Your Construction Projects?</h2>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          Let our AI analyze your project data and provide actionable insights to reduce waste,
          improve efficiency, and deliver projects on time and under budget.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
            Start Analysis <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
            Learn More
          </Button>
        </div>
      </section>
    </div>
  );
}
