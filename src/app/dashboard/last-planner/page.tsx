"use client";

// Last Planner System Page
import { useState } from "react";
import { useProjects } from "@/client-lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Target,
  TrendingUp,
  Plus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface Project {
  id: string;
  name: string;
}

interface WeeklyTask {
  id: string;
  task: string;
  assignee: string;
  planned: boolean;
  completed: boolean;
  constraint?: string;
  day: number;
}

// Sample data
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const currentWeekTasks: WeeklyTask[] = [
  { id: "1", task: "Foundation excavation", assignee: "Team A", planned: true, completed: true, day: 0 },
  { id: "2", task: "Rebar installation", assignee: "Team B", planned: true, completed: true, day: 1 },
  { id: "3", task: "Concrete pour - Section A", assignee: "Team A", planned: true, completed: false, constraint: "Weather delay", day: 2 },
  { id: "4", task: "Electrical conduit rough-in", assignee: "Team C", planned: true, completed: true, day: 2 },
  { id: "5", task: "Concrete pour - Section B", assignee: "Team A", planned: true, completed: false, day: 3 },
  { id: "6", task: "Plumbing rough-in", assignee: "Team D", planned: true, completed: true, day: 3 },
  { id: "7", task: "Steel framing Level 1", assignee: "Team B", planned: true, completed: false, constraint: "Material delivery", day: 4 },
  { id: "8", task: "Inspection coordination", assignee: "PM", planned: true, completed: true, day: 4 },
  { id: "9", task: "Formwork removal", assignee: "Team A", planned: true, completed: false, day: 5 },
];

const constraintLog = [
  { id: "1", constraint: "Weather conditions", status: "resolved", impact: "1 day delay", resolution: "Rescheduled to clear day" },
  { id: "2", constraint: "Material delivery delayed", status: "active", impact: "Blocking steel framing", resolution: "Expedited shipping requested" },
  { id: "3", constraint: "Inspector availability", status: "resolved", impact: "4 hour wait", resolution: "Scheduled in advance" },
  { id: "4", constraint: "Crew shortage", status: "active", impact: "Reduced productivity", resolution: "Overtime approved" },
];

export default function LastPlannerPage() {
  const { data: projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [tasks, setTasks] = useState<WeeklyTask[]>(currentWeekTasks);
  const [currentWeek] = useState(new Date());

  const completedTasks = tasks.filter(t => t.completed).length;
  const plannedTasks = tasks.filter(t => t.planned).length;
  const ppc = plannedTasks > 0 ? Math.round((completedTasks / plannedTasks) * 100) : 0;
  const constraintsActive = constraintLog.filter(c => c.status === "active").length;

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const getWeekRange = () => {
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - start.getDay() + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 5);
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  const getTasksForDay = (dayIndex: number) => {
    return tasks.filter(t => t.day === dayIndex);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Last Planner System</h1>
          <p className="text-muted-foreground">Weekly work planning and constraint management</p>
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
            Add Task
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ppc}%</p>
                <p className="text-xs text-muted-foreground">PPC (Plan %)</p>
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
                <p className="text-2xl font-bold">{completedTasks}/{plannedTasks}</p>
                <p className="text-xs text-muted-foreground">Tasks Completed</p>
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
                <p className="text-2xl font-bold">{constraintsActive}</p>
                <p className="text-xs text-muted-foreground">Active Constraints</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">85%</p>
                <p className="text-xs text-muted-foreground">4-Week Avg PPC</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Work Plan
              </CardTitle>
              <CardDescription>{getWeekRange()}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">Today</Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-4">
            {weekDays.map((day, index) => (
              <div key={day} className="space-y-2">
                <div className="text-center p-2 bg-muted rounded-lg">
                  <p className="font-medium">{day}</p>
                </div>
                <div className="space-y-2 min-h-[200px]">
                  {getTasksForDay(index).map((task) => (
                    <div 
                      key={task.id}
                      className={`p-3 rounded-lg border text-sm ${
                        task.completed 
                          ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" 
                          : task.constraint 
                            ? "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                            : "bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          checked={task.completed}
                          onCheckedChange={() => toggleTaskCompletion(task.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-xs ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                            {task.task}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Users className="h-3 w-3 inline mr-1" />
                            {task.assignee}
                          </p>
                          {task.constraint && (
                            <Badge variant="destructive" className="mt-2 text-xs">
                              {task.constraint}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PPC and Constraints */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* PPC Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              PPC Performance Trend
            </CardTitle>
            <CardDescription>Percent Plan Complete over last 8 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { week: "Week 1", ppc: 72, target: 80 },
                { week: "Week 2", ppc: 78, target: 80 },
                { week: "Week 3", ppc: 85, target: 80 },
                { week: "Week 4", ppc: 82, target: 80 },
                { week: "Week 5", ppc: 88, target: 80 },
                { week: "Week 6", ppc: 91, target: 80 },
                { week: "Week 7", ppc: 85, target: 80 },
                { week: "Current", ppc: ppc, target: 80 },
              ].map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className={item.week === "Current" ? "font-medium" : "text-muted-foreground"}>
                      {item.week}
                    </span>
                    <span className={`font-medium ${item.ppc >= item.target ? "text-green-600" : "text-orange-600"}`}>
                      {item.ppc}%
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={item.ppc} className="h-2" />
                    <div 
                      className="absolute top-0 h-2 w-0.5 bg-red-500"
                      style={{ left: `${item.target}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span className="text-muted-foreground">Actual PPC</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-0.5 h-3 bg-red-500" />
                <span className="text-muted-foreground">Target (80%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Constraint Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Constraint Log
            </CardTitle>
            <CardDescription>Track and resolve blockers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {constraintLog.map((item) => (
                <div 
                  key={item.id}
                  className={`p-4 rounded-lg border ${
                    item.status === "active" 
                      ? "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                      : "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium">{item.constraint}</p>
                    <Badge variant={item.status === "active" ? "destructive" : "default"}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Impact: {item.impact}
                    </p>
                    <p className="text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 inline mr-1" />
                      Resolution: {item.resolution}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Log New Constraint
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
