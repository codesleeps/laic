"use client";

// Reports Page
import { useState } from "react";
import { useProjects } from "@/client-lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  FileText,
  Download,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Send,
  BarChart3,
  PieChart,
  Target,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
}

interface Report {
  id: string;
  name: string;
  type: string;
  project: string;
  generatedAt: string;
  status: "completed" | "generating" | "scheduled";
  format: "pdf" | "excel" | "csv";
  size: string;
}

const sampleReports: Report[] = [
  {
    id: "1",
    name: "Weekly Waste Analysis",
    type: "Waste Report",
    project: "Downtown Office Tower",
    generatedAt: "2024-12-23T10:30:00",
    status: "completed",
    format: "pdf",
    size: "2.4 MB"
  },
  {
    id: "2",
    name: "Monthly Progress Report",
    type: "Progress Report",
    project: "All Projects",
    generatedAt: "2024-12-22T09:00:00",
    status: "completed",
    format: "pdf",
    size: "5.1 MB"
  },
  {
    id: "3",
    name: "5S Assessment Summary",
    type: "5S Report",
    project: "Harbor View Complex",
    generatedAt: "2024-12-21T14:15:00",
    status: "completed",
    format: "excel",
    size: "1.8 MB"
  },
  {
    id: "4",
    name: "Cost Forecast Report",
    type: "Financial Report",
    project: "Metro Station Renovation",
    generatedAt: "2024-12-20T11:45:00",
    status: "completed",
    format: "pdf",
    size: "3.2 MB"
  },
  {
    id: "5",
    name: "LPS Performance Report",
    type: "Last Planner Report",
    project: "Downtown Office Tower",
    generatedAt: "2024-12-24T08:00:00",
    status: "scheduled",
    format: "pdf",
    size: "-"
  },
];

const reportTemplates = [
  { id: "waste", name: "Waste Analysis Report", icon: AlertTriangle, description: "DOWNTIME waste breakdown and trends" },
  { id: "progress", name: "Project Progress Report", icon: TrendingUp, description: "Schedule and milestone status" },
  { id: "5s", name: "5S Assessment Report", icon: CheckCircle2, description: "Workplace organization scores" },
  { id: "lps", name: "Last Planner Report", icon: Target, description: "PPC and constraint analysis" },
  { id: "financial", name: "Financial Report", icon: DollarSign, description: "Budget and cost analysis" },
  { id: "executive", name: "Executive Summary", icon: BarChart3, description: "High-level KPIs and insights" },
];

const formatIcons: Record<string, string> = {
  pdf: "📄",
  excel: "📊",
  csv: "📋"
};

export default function ReportsPage() {
  const { data: projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [reports] = useState<Report[]>(sampleReports);
  
  const [newReport, setNewReport] = useState({
    template: "",
    project: "",
    format: "pdf",
    schedule: "once"
  });

  const filteredReports = selectedProject === "all" 
    ? reports 
    : reports.filter(r => r.project.toLowerCase().includes(selectedProject.toLowerCase()));

  const handleGenerateReport = () => {
    toast.success("Report generation started");
    setIsGenerateOpen(false);
    setNewReport({ template: "", project: "", format: "pdf", schedule: "once" });
  };

  const handleDownload = (report: Report) => {
    toast.success(`Downloading ${report.name}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Generate and manage project reports</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {(projects || []).map((project: Project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Generate Report</DialogTitle>
                <DialogDescription>
                  Create a new report from a template
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Report Template</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {reportTemplates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          newReport.template === template.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setNewReport({ ...newReport, template: template.id })}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <template.icon className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm">{template.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Project</Label>
                    <Select
                      value={newReport.project}
                      onValueChange={(value) => setNewReport({ ...newReport, project: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        {(projects || []).map((project: Project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Select
                      value={newReport.format}
                      onValueChange={(value) => setNewReport({ ...newReport, format: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                        <SelectItem value="csv">CSV File</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Schedule</Label>
                  <Select
                    value={newReport.schedule}
                    onValueChange={(value) => setNewReport({ ...newReport, schedule: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Generate Once</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerateReport}>
                  Generate Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reports.length}</p>
                <p className="text-xs text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reports.filter(r => r.status === "completed").length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reports.filter(r => r.status === "scheduled").length}</p>
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">6</p>
                <p className="text-xs text-muted-foreground">Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Generate</CardTitle>
          <CardDescription>Generate common reports with one click</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {reportTemplates.map((template) => (
              <Button
                key={template.id}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => toast.success(`Generating ${template.name}...`)}
              >
                <template.icon className="h-6 w-6 text-blue-600" />
                <span className="text-xs text-center">{template.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Your generated and scheduled reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No reports found</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{formatIcons[report.format]}</div>
                    <div>
                      <h3 className="font-medium">{report.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span>{report.type}</span>
                        <span>•</span>
                        <span>{report.project}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(report.generatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        report.status === "completed" ? "default" :
                        report.status === "scheduled" ? "secondary" : "outline"
                      }
                    >
                      {report.status === "scheduled" && <Clock className="h-3 w-3 mr-1" />}
                      {report.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {report.size}
                    </span>
                    {report.status === "completed" ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(report)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.success("Report sent via email")}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-[88px]" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
