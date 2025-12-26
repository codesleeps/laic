"use client";

// Value Stream Mapping Page
import { useState } from "react";
import { useProjects } from "@/client-lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Target,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Download,
  Plus,
  Zap,
  TrendingUp
} from "lucide-react";

interface Project {
  id: string;
  name: string;
}

interface ProcessStep {
  id: string;
  name: string;
  duration: number;
  waitTime: number;
  valueAdded: boolean;
  issues: string[];
}

// Sample VSM data
const sampleProcessSteps: ProcessStep[] = [
  { id: "1", name: "Material Delivery", duration: 4, waitTime: 8, valueAdded: false, issues: ["Delayed deliveries", "Storage constraints"] },
  { id: "2", name: "Material Inspection", duration: 2, waitTime: 1, valueAdded: true, issues: [] },
  { id: "3", name: "Foundation Prep", duration: 16, waitTime: 4, valueAdded: true, issues: ["Weather delays"] },
  { id: "4", name: "Foundation Pour", duration: 8, waitTime: 2, valueAdded: true, issues: [] },
  { id: "5", name: "Curing Time", duration: 168, waitTime: 0, valueAdded: false, issues: [] },
  { id: "6", name: "Framing", duration: 40, waitTime: 8, valueAdded: true, issues: ["Crew availability"] },
  { id: "7", name: "Inspection Wait", duration: 0, waitTime: 24, valueAdded: false, issues: ["Inspector scheduling"] },
  { id: "8", name: "MEP Rough-In", duration: 32, waitTime: 4, valueAdded: true, issues: [] },
  { id: "9", name: "Insulation", duration: 16, waitTime: 2, valueAdded: true, issues: [] },
  { id: "10", name: "Drywall", duration: 24, waitTime: 4, valueAdded: true, issues: [] },
];

export default function ValueStreamPage() {
  const { data: projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [processSteps] = useState<ProcessStep[]>(sampleProcessSteps);

  const totalDuration = processSteps.reduce((sum, step) => sum + step.duration, 0);
  const totalWaitTime = processSteps.reduce((sum, step) => sum + step.waitTime, 0);
  const valueAddedTime = processSteps.filter(s => s.valueAdded).reduce((sum, step) => sum + step.duration, 0);
  const nonValueAddedTime = processSteps.filter(s => !s.valueAdded).reduce((sum, step) => sum + step.duration, 0);
  const efficiency = Math.round((valueAddedTime / (totalDuration + totalWaitTime)) * 100);
  const stepsWithIssues = processSteps.filter(s => s.issues.length > 0).length;

  const formatHours = (hours: number) => {
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Value Stream Mapping</h1>
          <p className="text-muted-foreground">Visualize and optimize your construction process flow</p>
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Map
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatHours(totalDuration)}</p>
                <p className="text-xs text-muted-foreground">Process Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Pause className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatHours(totalWaitTime)}</p>
                <p className="text-xs text-muted-foreground">Wait Time</p>
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
                <p className="text-2xl font-bold">{formatHours(valueAddedTime)}</p>
                <p className="text-xs text-muted-foreground">Value Added</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <RotateCcw className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatHours(nonValueAddedTime)}</p>
                <p className="text-xs text-muted-foreground">Non-Value Added</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{efficiency}%</p>
                <p className="text-xs text-muted-foreground">Efficiency</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stepsWithIssues}</p>
                <p className="text-xs text-muted-foreground">Issues Found</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Value Stream Map Visualization */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current State Map</CardTitle>
              <CardDescription>Process flow from material delivery to completion</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto pb-4">
            <div className="flex items-start gap-2 min-w-max">
              {processSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    {/* Process Box */}
                    <div 
                      className={`w-40 p-4 rounded-lg border-2 ${
                        step.valueAdded 
                          ? "bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-700" 
                          : "bg-yellow-50 border-yellow-300 dark:bg-yellow-950 dark:border-yellow-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={step.valueAdded ? "default" : "secondary"} className="text-xs">
                          {step.valueAdded ? "VA" : "NVA"}
                        </Badge>
                        {step.issues.length > 0 && (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                      <p className="font-medium text-sm mb-2 line-clamp-2">{step.name}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium">{formatHours(step.duration)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Wait:</span>
                          <span className={`font-medium ${step.waitTime > 4 ? "text-red-500" : ""}`}>
                            {formatHours(step.waitTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Issues */}
                    {step.issues.length > 0 && (
                      <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-950 rounded text-xs max-w-40">
                        {step.issues.map((issue, i) => (
                          <p key={i} className="text-orange-600 dark:text-orange-400">• {issue}</p>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Arrow */}
                  {index < processSteps.length - 1 && (
                    <ArrowRight className="h-6 w-6 text-muted-foreground mx-2 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-6 mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded" />
              <span className="text-sm text-muted-foreground">Value Added (VA)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded" />
              <span className="text-sm text-muted-foreground">Non-Value Added (NVA)</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Has Issues</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Improvement Opportunities */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Improvement Opportunities
            </CardTitle>
            <CardDescription>AI-identified areas for waste reduction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-red-700 dark:text-red-400">Reduce Inspection Wait Time</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    24-hour wait for inspector scheduling could be reduced to 4 hours with dedicated inspector contract.
                  </p>
                </div>
                <Badge className="bg-red-100 text-red-800">High Impact</Badge>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Potential Savings:</span>
                <span className="font-bold text-green-600">20 hours/project</span>
              </div>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-orange-700 dark:text-orange-400">Optimize Material Delivery</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Just-in-time delivery could eliminate 8 hours of wait time and reduce storage costs.
                  </p>
                </div>
                <Badge className="bg-orange-100 text-orange-800">Medium Impact</Badge>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Potential Savings:</span>
                <span className="font-bold text-green-600">$5,000/project</span>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-yellow-700 dark:text-yellow-400">Crew Scheduling Optimization</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Better crew coordination during framing could reduce wait time by 50%.
                  </p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Low Impact</Badge>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Potential Savings:</span>
                <span className="font-bold text-green-600">4 hours/project</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Future State Projection
            </CardTitle>
            <CardDescription>Projected metrics after implementing improvements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Lead Time</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground line-through">{formatHours(totalDuration + totalWaitTime)}</span>
                  <ArrowRight className="h-4 w-4" />
                  <span className="font-bold text-green-600">{formatHours(Math.round((totalDuration + totalWaitTime) * 0.75))}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Wait Time</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground line-through">{formatHours(totalWaitTime)}</span>
                  <ArrowRight className="h-4 w-4" />
                  <span className="font-bold text-green-600">{formatHours(Math.round(totalWaitTime * 0.4))}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Process Efficiency</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground line-through">{efficiency}%</span>
                  <ArrowRight className="h-4 w-4" />
                  <span className="font-bold text-green-600">{Math.min(efficiency + 15, 95)}%</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Projected Savings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">$45,000</p>
                  <p className="text-xs text-muted-foreground">Per Project</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">3 Days</p>
                  <p className="text-xs text-muted-foreground">Time Reduction</p>
                </div>
              </div>
            </div>

            <Button className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Generate Improvement Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
