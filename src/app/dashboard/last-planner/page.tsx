"use client";

// Last Planner System Page
import { useState } from "react";
import { useProjects, useTasks, useTeamMembers, createTask, updateTask, TaskWithDetails, TeamMemberData } from "@/client-lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  ChevronRight,
  Loader2,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
}

// Week navigation helpers
const getMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date: Date, n: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

const formatDateToISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function LastPlannerPage() {
  const { data: projects } = useProjects();
  const { data: teamMembers } = useTeamMembers();
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  
  // Add Task dialog state
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTask, setNewTask] = useState<{
    title: string;
    project_id: string;
    assigned_to: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    planned_start: string;
    planned_end: string;
    description: string;
  }>({
    title: "",
    project_id: "",
    assigned_to: "",
    priority: "medium",
    planned_start: formatDateToISO(new Date()),
    planned_end: formatDateToISO(addDays(new Date(), 1)),
    description: "",
  });

  // Fetch tasks with selected project filter
  const { data: apiTasks, isLoading } = useTasks(
    selectedProject === "all" ? undefined : selectedProject
  );

  // Get week dates (Mon-Sat)
  const getWeekDates = (): Date[] => {
    return [0, 1, 2, 3, 4, 5].map(i => addDays(currentWeekStart, i));
  };

  const weekDates = getWeekDates();

  // Derive stats from real data
  const tasks = apiTasks ?? [];
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const plannedTasks = tasks.length;
  const ppc = plannedTasks > 0 ? Math.round((completedTasks / plannedTasks) * 100) : 0;
  
  // Derive constraint log from blocked tasks
  const constraintLog = tasks.filter(t => t.status === 'blocked');
  const constraintsActive = constraintLog.length;

  const toggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    await updateTask(taskId, { 
      status: task.status === 'completed' ? 'planned' : 'completed' 
    });
  };

  const getWeekRange = () => {
    const start = currentWeekStart;
    const end = addDays(start, 5);
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  const getTasksForDay = (dayIndex: number) => {
    const dayDate = formatDateToISO(weekDates[dayIndex]);
    return tasks.filter(t => t.planned_start && t.planned_start.split('T')[0] === dayDate);
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim() || !newTask.project_id) return;
    
    setIsSubmitting(true);
    try {
      await createTask({
        title: newTask.title.trim(),
        project_id: newTask.project_id,
        assigned_to: newTask.assigned_to || null,
        priority: newTask.priority,
        planned_start: newTask.planned_start,
        planned_end: newTask.planned_end,
        description: newTask.description || null,
        status: 'planned',
      });
      
      // Reset form and close dialog
      setNewTask({
        title: "",
        project_id: selectedProject === "all" ? "" : selectedProject,
        assigned_to: "",
        priority: "medium",
        planned_start: formatDateToISO(new Date()),
        planned_end: formatDateToISO(addDays(new Date(), 1)),
        description: "",
      });
      setIsAddTaskOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddTaskDialog = () => {
    setNewTask(prev => ({
      ...prev,
      project_id: selectedProject === "all" ? "" : selectedProject,
    }));
    setIsAddTaskOpen(true);
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
          <Button onClick={openAddTaskDialog}>
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
              <Button variant="outline" size="icon" onClick={() => setCurrentWeekStart(d => addDays(d, -7))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentWeekStart(getMonday(new Date()))}>Today</Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentWeekStart(d => addDays(d, 7))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-6 gap-4">
              {weekDays.map((day) => (
                <div key={day} className="space-y-2">
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <p className="font-medium">{day}</p>
                  </div>
                  <div className="space-y-2 min-h-[200px]">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-4">
              {weekDays.map((day, index) => (
                <div key={day} className="space-y-2">
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <p className="font-medium">{day}</p>
                    <p className="text-xs text-muted-foreground">
                      {weekDates[index].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="space-y-2 min-h-[200px]">
                    {getTasksForDay(index).map((task) => (
                      <div 
                        key={task.id}
                        className={`p-3 rounded-lg border text-sm ${
                          task.status === 'completed' 
                            ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" 
                            : task.status === 'blocked' 
                              ? "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                              : "bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <Checkbox 
                            checked={task.status === 'completed'}
                            onCheckedChange={() => toggleTaskCompletion(task.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-xs ${task.status === 'completed' ? "line-through text-muted-foreground" : ""}`}>
                              {task.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              <Users className="h-3 w-3 inline mr-1" />
                              {task.assignee_name || task.assigned_to || 'Unassigned'}
                            </p>
                            {task.blockers && (
                              <Badge variant="destructive" className="mt-2 text-xs">
                                {task.blockers}
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
          )}
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
              {constraintLog.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>No active constraints</p>
                </div>
              ) : (
                constraintLog.map((task) => (
                  <div 
                    key={task.id}
                    className="p-4 rounded-lg border bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium">{task.title}</p>
                      <Badge variant="destructive">active</Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Impact: {task.blockers || 'Not specified'}
                      </p>
                      <p className="text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 inline mr-1" />
                        Resolution: {task.description ?? '—'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Log New Constraint
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project">Project *</Label>
              <Select
                value={newTask.project_id}
                onValueChange={(value) => setNewTask({ ...newTask, project_id: value })}
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
            <div className="grid gap-2">
              <Label htmlFor="assignee">Assigned To</Label>
              <Select
                value={newTask.assigned_to}
                onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {(teamMembers || []).map((member: TeamMemberData) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newTask.priority}
                onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                  setNewTask({ ...newTask, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="planned_start">Planned Start</Label>
                <Input
                  id="planned_start"
                  type="date"
                  value={newTask.planned_start}
                  onChange={(e) => setNewTask({ ...newTask, planned_start: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="planned_end">Planned End</Label>
                <Input
                  id="planned_end"
                  type="date"
                  value={newTask.planned_end}
                  onChange={(e) => setNewTask({ ...newTask, planned_end: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description (optional)"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddTask} 
              disabled={!newTask.title.trim() || !newTask.project_id || isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
