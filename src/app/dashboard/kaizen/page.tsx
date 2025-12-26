"use client";

// Kaizen Events Page
import { useState } from "react";
import { useProjects } from "@/client-lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  TrendingUp,
  Users,
  Calendar,
  Target,
  CheckCircle2,
  Clock,
  DollarSign,
  Plus,
  Lightbulb,
  Zap,
  ArrowRight,
  PlayCircle
} from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
}

interface KaizenEvent {
  id: string;
  title: string;
  project: string;
  status: "planning" | "in_progress" | "completed";
  startDate: string;
  endDate: string;
  team: string[];
  problem: string;
  targetImprovement: string;
  actualImprovement?: string;
  savings: number;
  progress: number;
}

const sampleKaizenEvents: KaizenEvent[] = [
  {
    id: "1",
    title: "Reduce Material Handling Time",
    project: "Downtown Office Tower",
    status: "completed",
    startDate: "2024-12-01",
    endDate: "2024-12-05",
    team: ["John Smith", "Maria Garcia", "David Lee"],
    problem: "Excessive time spent moving materials from staging area to work zones",
    targetImprovement: "Reduce handling time by 30%",
    actualImprovement: "Achieved 42% reduction in material handling time",
    savings: 25000,
    progress: 100
  },
  {
    id: "2",
    title: "Optimize Inspection Workflow",
    project: "Harbor View Complex",
    status: "in_progress",
    startDate: "2024-12-18",
    endDate: "2024-12-22",
    team: ["Sarah Wilson", "Mike Johnson", "Lisa Chen"],
    problem: "Long wait times for inspections causing schedule delays",
    targetImprovement: "Reduce inspection wait time by 50%",
    savings: 15000,
    progress: 65
  },
  {
    id: "3",
    title: "Standardize Tool Organization",
    project: "Metro Station Renovation",
    status: "planning",
    startDate: "2024-12-28",
    endDate: "2025-01-02",
    team: ["Tom Brown", "Emily Davis"],
    problem: "Workers spending too much time searching for tools",
    targetImprovement: "Eliminate tool search time",
    savings: 8000,
    progress: 10
  },
];

const statusColors: Record<string, string> = {
  planning: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
};

export default function KaizenPage() {
  const { data: projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const [events] = useState<KaizenEvent[]>(sampleKaizenEvents);
  
  const [newEvent, setNewEvent] = useState({
    title: "",
    project: "",
    startDate: "",
    endDate: "",
    problem: "",
    targetImprovement: "",
    team: ""
  });

  const filteredEvents = selectedProject === "all" 
    ? events 
    : events.filter(e => e.project.toLowerCase().includes(selectedProject.toLowerCase()));

  const totalSavings = events.reduce((sum, e) => sum + e.savings, 0);
  const completedEvents = events.filter(e => e.status === "completed").length;
  const activeEvents = events.filter(e => e.status === "in_progress").length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmitEvent = () => {
    toast.success("Kaizen event created successfully");
    setIsNewEventOpen(false);
    setNewEvent({
      title: "",
      project: "",
      startDate: "",
      endDate: "",
      problem: "",
      targetImprovement: "",
      team: ""
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Kaizen Events</h1>
          <p className="text-muted-foreground">Rapid improvement workshops for continuous enhancement</p>
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
          <Dialog open={isNewEventOpen} onOpenChange={setIsNewEventOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Plan New Kaizen Event</DialogTitle>
                <DialogDescription>
                  Schedule a rapid improvement workshop
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Event Title</Label>
                  <Input
                    placeholder="e.g., Reduce Setup Time"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Project</Label>
                    <Select
                      value={newEvent.project}
                      onValueChange={(value) => setNewEvent({ ...newEvent, project: value })}
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
                    <Label>Team Members</Label>
                    <Input
                      placeholder="Names separated by comma"
                      value={newEvent.team}
                      onChange={(e) => setNewEvent({ ...newEvent, team: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Problem Statement</Label>
                  <Textarea
                    placeholder="Describe the problem or waste to be eliminated..."
                    value={newEvent.problem}
                    onChange={(e) => setNewEvent({ ...newEvent, problem: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Improvement</Label>
                  <Input
                    placeholder="e.g., Reduce cycle time by 25%"
                    value={newEvent.targetImprovement}
                    onChange={(e) => setNewEvent({ ...newEvent, targetImprovement: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewEventOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitEvent}>
                  Create Event
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
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{events.length}</p>
                <p className="text-xs text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <PlayCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeEvents}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
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
                <p className="text-2xl font-bold">{completedEvents}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalSavings)}</p>
                <p className="text-xs text-muted-foreground">Total Savings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kaizen Process Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Kaizen Event Process
          </CardTitle>
          <CardDescription>The rapid improvement cycle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {[
              { step: 1, title: "Define", desc: "Identify the problem", icon: Target },
              { step: 2, title: "Measure", desc: "Gather current data", icon: TrendingUp },
              { step: 3, title: "Analyze", desc: "Find root causes", icon: Zap },
              { step: 4, title: "Improve", desc: "Implement solutions", icon: ArrowRight },
              { step: 5, title: "Control", desc: "Sustain the gains", icon: CheckCircle2 },
            ].map((phase, index) => (
              <div key={phase.step} className="flex items-center">
                <div className="text-center min-w-[120px]">
                  <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-2">
                    <phase.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="font-medium text-sm">{phase.step}. {phase.title}</p>
                  <p className="text-xs text-muted-foreground">{phase.desc}</p>
                </div>
                {index < 4 && (
                  <ArrowRight className="h-6 w-6 text-muted-foreground mx-2 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Kaizen Events</h2>
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Zap className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Kaizen events found</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start a rapid improvement workshop to eliminate waste
              </p>
              <Button onClick={() => setIsNewEventOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Plan Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge className={statusColors[event.status]}>
                      {event.status === "in_progress" ? "In Progress" : event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </Badge>
                    {event.status === "completed" && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{formatCurrency(event.savings)}</p>
                        <p className="text-xs text-muted-foreground">Saved</p>
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-2">{event.title}</CardTitle>
                  <CardDescription>{event.project}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{event.progress}%</span>
                    </div>
                    <Progress value={event.progress} />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{event.team.length} team members</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium mb-1">Problem:</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.problem}</p>
                  </div>

                  <div className="pt-2">
                    <p className="text-sm font-medium mb-1">Target:</p>
                    <p className="text-sm text-blue-600">{event.targetImprovement}</p>
                  </div>

                  {event.actualImprovement && (
                    <div className="pt-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <p className="text-sm font-medium mb-1 text-green-700 dark:text-green-400">Result:</p>
                      <p className="text-sm text-green-600 dark:text-green-400">{event.actualImprovement}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
