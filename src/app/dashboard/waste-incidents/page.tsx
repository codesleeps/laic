"use client";

// Waste Incidents Tracking Page
import { useState } from "react";
import { 
  useWasteIncidents, 
  useWasteSummary, 
  useProjects, 
  useWasteCategories, 
  createWasteIncident,
  WasteSummaryItem
} from "@/client-lib/api-client";
import type { WasteCategory } from "@/shared/models/lean-construction";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  AlertTriangle,
  Filter,
  TrendingDown,
  DollarSign,
  Clock,
  Package,
  Truck,
  Users,
  Move,
  Settings,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

const severityColors: Record<string, string> = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

const wasteIcons: Record<string, React.ReactNode> = {
  D: <RefreshCw className="h-4 w-4" />,
  O: <Package className="h-4 w-4" />,
  W: <Clock className="h-4 w-4" />,
  N: <Users className="h-4 w-4" />,
  T: <Truck className="h-4 w-4" />,
  I: <Package className="h-4 w-4" />,
  M: <Move className="h-4 w-4" />,
  E: <Settings className="h-4 w-4" />,
};

export default function WasteIncidentsPage() {
  const { data: incidents, error, isLoading, mutate } = useWasteIncidents();
  const { data: wasteSummary } = useWasteSummary();
  const { data: projects } = useProjects();
  const { data: categories } = useWasteCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    project_id: "",
    category_id: "",
    description: "",
    severity: "medium",
    cost_impact: "",
    time_impact_hours: "",
    root_cause: "",
    corrective_action: "",
    reported_by: "",
  });

  const resetForm = () => {
    setFormData({
      project_id: "",
      category_id: "",
      description: "",
      severity: "medium",
      cost_impact: "",
      time_impact_hours: "",
      root_cause: "",
      corrective_action: "",
      reported_by: "",
    });
  };

  const handleCreateIncident = async () => {
    if (!formData.project_id || !formData.category_id || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createWasteIncident({
        project_id: formData.project_id,
        category_id: formData.category_id,
        description: formData.description,
        severity: formData.severity,
        cost_impact: formData.cost_impact ? parseFloat(formData.cost_impact) : 0,
        time_impact_hours: formData.time_impact_hours ? parseFloat(formData.time_impact_hours) : 0,
        root_cause: formData.root_cause,
        corrective_action: formData.corrective_action,
        reported_by: formData.reported_by,
      });
      toast.success("Waste incident reported successfully");
      setIsCreateDialogOpen(false);
      resetForm();
      mutate();
    } catch {
      toast.error("Failed to report incident");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredIncidents = (incidents || []).filter((incident) => {
    const matchesSearch = incident.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.root_cause?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === "all" || incident.severity === severityFilter;
    const matchesCategory = categoryFilter === "all" || incident.waste_category_id === categoryFilter;
    return matchesSearch && matchesSeverity && matchesCategory;
  });

  const formatCurrency = (amount: number | null | undefined) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalCostImpact = (incidents || []).reduce((sum, i) => sum + (i.estimated_cost_impact || 0), 0);
  const totalTimeImpact = (incidents || []).reduce((sum, i) => sum + (i.estimated_time_impact || 0), 0);
  const criticalCount = (incidents || []).filter((i) => i.severity === "critical" || i.severity === "high").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-muted-foreground">Failed to load waste incidents</p>
        <Button onClick={() => mutate()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Waste Incidents</h1>
          <p className="text-muted-foreground">Track and analyze the 8 wastes (DOWNTIME) across projects</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Report Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Report Waste Incident</DialogTitle>
              <DialogDescription>
                Document a waste incident for root cause analysis and continuous improvement
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="project">Project *</Label>
                  <Select
                    value={formData.project_id}
                    onValueChange={(value) => setFormData({ ...formData, project_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {(projects || []).map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Waste Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(categories || []).map((category: WasteCategory) => (
                        <SelectItem key={category.id} value={category.id}>
                          [{category.code}] {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the waste incident..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value) => setFormData({ ...formData, severity: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reported_by">Reported By</Label>
                  <Input
                    id="reported_by"
                    value={formData.reported_by}
                    onChange={(e) => setFormData({ ...formData, reported_by: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cost_impact">Cost Impact ($)</Label>
                  <Input
                    id="cost_impact"
                    type="number"
                    value={formData.cost_impact}
                    onChange={(e) => setFormData({ ...formData, cost_impact: e.target.value })}
                    placeholder="e.g., 5000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time_impact">Time Impact (hours)</Label>
                  <Input
                    id="time_impact"
                    type="number"
                    value={formData.time_impact_hours}
                    onChange={(e) => setFormData({ ...formData, time_impact_hours: e.target.value })}
                    placeholder="e.g., 8"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="root_cause">Root Cause</Label>
                <Textarea
                  id="root_cause"
                  value={formData.root_cause}
                  onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                  placeholder="What caused this waste?"
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="corrective_action">Corrective Action</Label>
                <Textarea
                  id="corrective_action"
                  value={formData.corrective_action}
                  onChange={(e) => setFormData({ ...formData, corrective_action: e.target.value })}
                  placeholder="What actions will be taken to prevent recurrence?"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateIncident} disabled={isSubmitting}>
                {isSubmitting ? "Reporting..." : "Report Incident"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{incidents?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total Incidents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <TrendingDown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{criticalCount}</p>
                <p className="text-xs text-muted-foreground">High/Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalCostImpact)}</p>
                <p className="text-xs text-muted-foreground">Cost Impact</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTimeImpact}h</p>
                <p className="text-xs text-muted-foreground">Time Lost</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DOWNTIME Summary */}
      <Card>
        <CardHeader>
          <CardTitle>DOWNTIME Waste Breakdown</CardTitle>
          <CardDescription>Incidents by waste category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {(wasteSummary || []).map((summary: WasteSummaryItem) => (
              <div 
                key={summary.id} 
                className="p-4 bg-muted/50 rounded-lg text-center hover:bg-muted transition-colors"
              >
                <div className="flex justify-center mb-2 text-muted-foreground">
                  {wasteIcons[summary.code] || <AlertTriangle className="h-4 w-4" />}
                </div>
                <p className="text-2xl font-bold">{summary.incident_count}</p>
                <p className="text-xs text-muted-foreground truncate" title={summary.name}>
                  {summary.code} - {summary.name}
                </p>
                <p className="text-xs text-red-500 mt-1">
                  {formatCurrency(summary.total_cost_impact)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {(categories || []).map((category: WasteCategory) => (
              <SelectItem key={category.id} value={category.id}>
                [{category.code}] {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Incidents Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Cost Impact</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No waste incidents found
                  </TableCell>
                </TableRow>
              ) : (
                filteredIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(incident.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {incident.waste_name || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {incident.description}
                    </TableCell>
                    <TableCell>
                      <Badge className={severityColors[incident.severity] || severityColors.medium}>
                        {incident.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-red-500 font-medium">
                      {formatCurrency(incident.estimated_cost_impact)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[incident.status] || statusColors.open}>
                        {incident.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
