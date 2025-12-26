"use client";

import { useState } from "react";
import { useProjects } from "@/client-lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
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
  Zap,
  ClipboardCheck,
  TrendingUp,
  AlertTriangle,
  Plus,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Camera
} from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
}

interface Assessment {
  id: string;
  project: string;
  location: string;
  date: string;
  sort: number;
  setInOrder: number;
  shine: number;
  standardize: number;
  sustain: number;
  overall: number;
  findings: string[];
  status: "pass" | "fail" | "needs_improvement";
}

const sampleAssessments: Assessment[] = [
  {
    id: "1",
    project: "Downtown Office Tower",
    location: "Level 3 - Electrical Room",
    date: "2024-12-20",
    sort: 85,
    setInOrder: 90,
    shine: 75,
    standardize: 80,
    sustain: 70,
    overall: 80,
    findings: ["Tools not returned to designated locations", "Excess materials stored in walkway"],
    status: "needs_improvement"
  },
  {
    id: "2",
    project: "Harbor View Complex",
    location: "Site Entrance & Staging Area",
    date: "2024-12-19",
    sort: 95,
    setInOrder: 92,
    shine: 88,
    standardize: 90,
    sustain: 85,
    overall: 90,
    findings: [],
    status: "pass"
  },
  {
    id: "3",
    project: "Metro Station Renovation",
    location: "Platform Construction Zone",
    date: "2024-12-18",
    sort: 60,
    setInOrder: 55,
    shine: 50,
    standardize: 65,
    sustain: 45,
    overall: 55,
    findings: ["Safety equipment not properly stored", "No clear labeling system", "Debris accumulation", "Inconsistent cleanup procedures"],
    status: "fail"
  },
];

const fiveSDescriptions = {
  sort: "Remove unnecessary items, keep only what's needed",
  setInOrder: "Organize items for easy access and return",
  shine: "Clean work area and equipment regularly",
  standardize: "Create consistent processes and visual controls",
  sustain: "Maintain and review standards continuously"
};

export default function FiveSAssessmentsPage() {
  const { data: projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false);
  const [assessments] = useState<Assessment[]>(sampleAssessments);
  
  const [newAssessment, setNewAssessment] = useState({
    project: "",
    location: "",
    sort: [75],
    setInOrder: [75],
    shine: [75],
    standardize: [75],
    sustain: [75],
    notes: ""
  });

  const filteredAssessments = selectedProject === "all" 
    ? assessments 
    : assessments.filter(a => a.project.toLowerCase().includes(selectedProject.toLowerCase()));

  const avgScore = assessments.length > 0 
    ? Math.round(assessments.reduce((sum, a) => sum + a.overall, 0) / assessments.length)
    : 0;
  
  const passRate = assessments.length > 0
    ? Math.round((assessments.filter(a => a.status === "pass").length / assessments.length) * 100)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pass":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Pass</Badge>;
      case "fail":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Fail</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Needs Improvement</Badge>;
    }
  };

  const handleSubmitAssessment = () => {
    toast.success("Assessment submitted successfully");
    setIsNewAssessmentOpen(false);
    setNewAssessment({
      project: "",
      location: "",
      sort: [75],
      setInOrder: [75],
      shine: [75],
      standardize: [75],
      sustain: [75],
      notes: ""
    });
  };

  const calculateOverall = () => {
    return Math.round(
      (newAssessment.sort[0]! + newAssessment.setInOrder[0]! + newAssessment.shine[0]! + 
       newAssessment.standardize[0]! + newAssessment.sustain[0]!) / 5
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">5S Assessments</h1>
          <p className="text-muted-foreground">Workplace organization audits and continuous improvement</p>
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
          <Dialog open={isNewAssessmentOpen} onOpenChange={setIsNewAssessmentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Assessment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New 5S Assessment</DialogTitle>
                <DialogDescription>
                  Conduct a workplace organization audit
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Project</Label>
                    <Select
                      value={newAssessment.project}
                      onValueChange={(value) => setNewAssessment({ ...newAssessment, project: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {(projects || []).map((project: Project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="e.g., Level 2 - Storage Area"
                      value={newAssessment.location}
                      onChange={(e) => setNewAssessment({ ...newAssessment, location: e.target.value })}
                    />
                  </div>
                </div>

                {/* 5S Scores */}
                <div className="space-y-6">
                  {[
                    { key: "sort", label: "Sort (Seiri)", icon: "🗂️" },
                    { key: "setInOrder", label: "Set in Order (Seiton)", icon: "📍" },
                    { key: "shine", label: "Shine (Seiso)", icon: "✨" },
                    { key: "standardize", label: "Standardize (Seiketsu)", icon: "📋" },
                    { key: "sustain", label: "Sustain (Shitsuke)", icon: "🔄" },
                  ].map((item) => (
                    <div key={item.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <span>{item.icon}</span>
                          {item.label}
                        </Label>
                        <span className={`font-bold ${getScoreColor((newAssessment[item.key as keyof typeof newAssessment] as number[])[0] ?? 0)}`}>
                          {(newAssessment[item.key as keyof typeof newAssessment] as number[])[0]}%
                        </span>
                      </div>
                      <Slider
                        value={newAssessment[item.key as keyof typeof newAssessment] as number[]}
                        onValueChange={(value) => setNewAssessment({ ...newAssessment, [item.key]: value })}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        {fiveSDescriptions[item.key as keyof typeof fiveSDescriptions]}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Overall Score */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Overall Score</span>
                    <span className={`text-2xl font-bold ${getScoreColor(calculateOverall())}`}>
                      {calculateOverall()}%
                    </span>
                  </div>
                  <Progress value={calculateOverall()} className="mt-2" />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Findings & Notes</Label>
                  <Textarea
                    placeholder="Document any issues, non-conformances, or improvement opportunities..."
                    value={newAssessment.notes}
                    onChange={(e) => setNewAssessment({ ...newAssessment, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Photo Upload Placeholder */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload photos or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewAssessmentOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitAssessment}>
                  Submit Assessment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ClipboardCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{assessments.length}</p>
                <p className="text-xs text-muted-foreground">Total Assessments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>{avgScore}%</p>
                <p className="text-xs text-muted-foreground">Average Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{passRate}%</p>
                <p className="text-xs text-muted-foreground">Pass Rate</p>
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
                <p className="text-2xl font-bold">{assessments.filter(a => a.status === "fail").length}</p>
                <p className="text-xs text-muted-foreground">Failed Audits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5S Overview */}
      <Card>
        <CardHeader>
          <CardTitle>5S Methodology Overview</CardTitle>
          <CardDescription>The five pillars of workplace organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {[
              { name: "Sort", japanese: "Seiri", icon: "🗂️", color: "bg-red-100 dark:bg-red-900", avg: 80 },
              { name: "Set in Order", japanese: "Seiton", icon: "📍", color: "bg-orange-100 dark:bg-orange-900", avg: 79 },
              { name: "Shine", japanese: "Seiso", icon: "✨", color: "bg-yellow-100 dark:bg-yellow-900", avg: 71 },
              { name: "Standardize", japanese: "Seiketsu", icon: "📋", color: "bg-green-100 dark:bg-green-900", avg: 78 },
              { name: "Sustain", japanese: "Shitsuke", icon: "🔄", color: "bg-blue-100 dark:bg-blue-900", avg: 67 },
            ].map((pillar, index) => (
              <div key={index} className={`p-4 rounded-lg ${pillar.color} text-center`}>
                <div className="text-3xl mb-2">{pillar.icon}</div>
                <h3 className="font-bold">{pillar.name}</h3>
                <p className="text-xs text-muted-foreground">{pillar.japanese}</p>
                <p className={`text-xl font-bold mt-2 ${getScoreColor(pillar.avg)}`}>{pillar.avg}%</p>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Assessments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assessments</CardTitle>
          <CardDescription>Latest workplace organization audits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAssessments.map((assessment) => (
              <div 
                key={assessment.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{assessment.project}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {assessment.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(assessment.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getScoreColor(assessment.overall)}`}>
                        {assessment.overall}%
                      </p>
                      <p className="text-xs text-muted-foreground">Overall</p>
                    </div>
                    {getStatusBadge(assessment.status)}
                  </div>
                </div>

                {/* 5S Scores Bar */}
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {[
                    { label: "S", value: assessment.sort },
                    { label: "S", value: assessment.setInOrder },
                    { label: "S", value: assessment.shine },
                    { label: "S", value: assessment.standardize },
                    { label: "S", value: assessment.sustain },
                  ].map((item, index) => (
                    <div key={index} className="text-center">
                      <Progress value={item.value} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{item.value}%</p>
                    </div>
                  ))}
                </div>

                {/* Findings */}
                {assessment.findings.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium mb-2">Findings:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {assessment.findings.map((finding, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="h-3 w-3 text-orange-500 mt-1 shrink-0" />
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
