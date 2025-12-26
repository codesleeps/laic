"use client";

import { useState } from "react";
import { useRecommendations, useProjects, updateRecommendationStatus, RecommendationWithProject } from "@/client-lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  AlertTriangle,
  Filter,
  Lightbulb,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Brain,
  TrendingUp,
  Target
} from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/shared/models/lean-construction";

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  accepted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  implemented: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  accepted: <CheckCircle2 className="h-4 w-4" />,
  in_progress: <PlayCircle className="h-4 w-4" />,
  implemented: <CheckCircle2 className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
};

const categoryIcons: Record<string, React.ReactNode> = {
  waste_reduction: <TrendingUp className="h-5 w-5" />,
  process_improvement: <Target className="h-5 w-5" />,
  cost_optimization: <DollarSign className="h-5 w-5" />,
  safety: <AlertTriangle className="h-5 w-5" />,
  quality: <CheckCircle2 className="h-5 w-5" />,
  scheduling: <Clock className="h-5 w-5" />,
};

export default function RecommendationsPage() {
  const { data: recommendations, error, isLoading, mutate } = useRecommendations();
  const { data: projects } = useProjects();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendationWithProject | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (id: string, status: string) => {
    setIsUpdating(true);
    try {
      await updateRecommendationStatus(id, status);
      toast.success(`Recommendation ${status === "implemented" ? "marked as implemented" : status === "rejected" ? "rejected" : "updated"}`);
      mutate();
    } catch {
      toast.error("Failed to update recommendation");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredRecommendations = (recommendations || []).filter((rec) => {
    const matchesSearch = rec.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || rec.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || rec.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalPotentialSavings = (recommendations || [])
    .filter((r) => r.status === "pending" || r.status === "accepted")
    .reduce((sum, r) => sum + (r.potential_savings || 0), 0);
  
  const implementedSavings = (recommendations || [])
    .filter((r) => r.status === "implemented")
    .reduce((sum, r) => sum + (r.potential_savings || 0), 0);
  
  const pendingCount = (recommendations || []).filter((r) => r.status === "pending").length;
  const highPriorityCount = (recommendations || []).filter((r) => 
    (r.priority === "high" || r.priority === "critical") && r.status === "pending"
  ).length;

  const getProjectName = (projectId: string) => {
    const project = (projects || []).find((p: Project) => p.id === projectId);
    return project?.name || "Unknown Project";
  };

  const getEffortLabel = (hours: number | null) => {
    if (hours === null) return "Medium";
    if (hours < 40) return "Low (< 1 week)";
    if (hours < 160) return "Medium (1-4 weeks)";
    if (hours < 480) return "High (1-3 months)";
    return "Very High (3+ months)";
  };

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
        <p className="text-lg text-muted-foreground">Failed to load recommendations</p>
        <Button onClick={() => mutate()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">AI Recommendations</h1>
          <p className="text-muted-foreground">AI-generated improvement suggestions for your projects</p>
        </div>
        <Button variant="outline" asChild>
          <a href="/dashboard/ai-analysis">
            <Brain className="h-4 w-4 mr-2" />
            Generate New Analysis
          </a>
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{highPriorityCount}</p>
                <p className="text-xs text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalPotentialSavings)}</p>
                <p className="text-xs text-muted-foreground">Potential Savings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(implementedSavings)}</p>
                <p className="text-xs text-muted-foreground">Realized Savings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recommendations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="implemented">Implemented</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Recommendations Grid */}
      {filteredRecommendations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recommendations found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Run an AI analysis to generate recommendations for your projects"}
            </p>
            <Button asChild>
              <a href="/dashboard/ai-analysis">
                <Brain className="h-4 w-4 mr-2" />
                Generate Analysis
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecommendations.map((rec) => (
            <Card 
              key={rec.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedRecommendation(rec);
                setIsDetailDialogOpen(true);
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2 bg-muted rounded-lg">
                    {categoryIcons[rec.category] || <Lightbulb className="h-5 w-5" />}
                  </div>
                  <div className="flex gap-2">
                    <Badge className={priorityColors[rec.priority] || priorityColors.medium}>
                      {rec.priority}
                    </Badge>
                    <Badge className={statusColors[rec.status] || statusColors.pending}>
                      {statusIcons[rec.status]}
                      <span className="ml-1">{rec.status.replace("_", " ")}</span>
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg mt-3">{rec.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {rec.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Potential Savings</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(rec.potential_savings)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Time Saved</p>
                    <p className="text-sm font-medium">{rec.potential_time_saved ? `${rec.potential_time_saved}h` : "N/A"}</p>
                  </div>
                </div>
                
                {rec.ai_confidence !== null && (
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${rec.ai_confidence}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{rec.ai_confidence}%</span>
                  </div>
                )}

                <div className="pt-2 border-t flex justify-between items-center text-sm text-muted-foreground">
                  <span>{rec.project_name || getProjectName(rec.project_id)}</span>
                  <span>{formatDate(rec.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedRecommendation && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-muted rounded-lg">
                    {categoryIcons[selectedRecommendation.category] || <Lightbulb className="h-5 w-5" />}
                  </div>
                  <div className="flex gap-2">
                    <Badge className={priorityColors[selectedRecommendation.priority]}>
                      {selectedRecommendation.priority} priority
                    </Badge>
                    <Badge className={statusColors[selectedRecommendation.status]}>
                      {selectedRecommendation.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                <DialogTitle>{selectedRecommendation.title}</DialogTitle>
                <DialogDescription>
                  {selectedRecommendation.project_name || getProjectName(selectedRecommendation.project_id)} • {formatDate(selectedRecommendation.created_at)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedRecommendation.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Potential Savings</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedRecommendation.potential_savings)}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Time Saved</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {getEffortLabel(selectedRecommendation.potential_time_saved)}
                    </p>
                  </div>
                </div>

                {selectedRecommendation.ai_confidence !== null && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">AI Confidence Score</h4>
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-purple-500" />
                      <div className="flex-1 bg-muted rounded-full h-3">
                        <div 
                          className="bg-purple-500 h-3 rounded-full" 
                          style={{ width: `${selectedRecommendation.ai_confidence}%` }}
                        />
                      </div>
                      <span className="font-medium">{selectedRecommendation.ai_confidence}%</span>
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Source: AI Analysis Engine
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                {selectedRecommendation.status === "pending" && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => handleStatusUpdate(selectedRecommendation.id, "rejected")}
                      disabled={isUpdating}
                      className="text-red-600"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleStatusUpdate(selectedRecommendation.id, "accepted")}
                      disabled={isUpdating}
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                  </>
                )}
                {selectedRecommendation.status === "accepted" && (
                  <Button 
                    onClick={() => handleStatusUpdate(selectedRecommendation.id, "implemented")}
                    disabled={isUpdating}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Implemented
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setIsDetailDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}