"use client";

// Projects Management Page - LeanBuild AI
import { useState } from "react";
import { useProjects, createProject, updateProject, deleteProject } from "@/client-lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Building2, 
  Calendar, 
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Filter,
  MapPin,
  Users,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/shared/models/lean-construction";

type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

interface ProjectWithSpent extends Project {
  spent?: number;
  progress?: number;
}

const statusColors: Record<string, string> = {
  planning: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  on_hold: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusLabels: Record<string, string> = {
  planning: "Planning",
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

interface FormData {
  name: string;
  description: string;
  status: ProjectStatus;
  start_date: string;
  end_date: string;
  budget: string;
  location: string;
  client_name: string;
}

// Projects Page Component
export default function ProjectsPage() {
  const { data: projects, error, isLoading, mutate } = useProjects();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectWithSpent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    status: "planning",
    start_date: "",
    end_date: "",
    budget: "",
    location: "",
    client_name: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      status: "planning",
      start_date: "",
      end_date: "",
      budget: "",
      location: "",
      client_name: "",
    });
  };

  const handleCreateProject = async () => {
    if (!formData.name || !formData.start_date || !formData.budget) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createProject({
        name: formData.name,
        description: formData.description,
        status: formData.status,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        budget: parseFloat(formData.budget),
        location: formData.location,
        client_name: formData.client_name,
      });
      toast.success("Project created successfully");
      setIsCreateDialogOpen(false);
      resetForm();
      mutate();
    } catch {
      toast.error("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProject = async () => {
    if (!selectedProject || !formData.name) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await updateProject(selectedProject.id, {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        budget: parseFloat(formData.budget),
        location: formData.location,
        client_name: formData.client_name,
      });
      toast.success("Project updated successfully");
      setIsEditDialogOpen(false);
      setSelectedProject(null);
      resetForm();
      mutate();
    } catch {
      toast.error("Failed to update project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    
    setIsSubmitting(true);
    try {
      await deleteProject(selectedProject.id);
      toast.success("Project deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedProject(null);
      mutate();
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (project: ProjectWithSpent) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description || "",
      status: project.status,
      start_date: project.start_date?.split("T")[0] || "",
      end_date: project.end_date?.split("T")[0] || "",
      budget: project.budget?.toString() || "",
      location: project.location || "",
      client_name: project.client_name || "",
    });
    setIsEditDialogOpen(true);
  };

  const filteredProjects = (projects || []).filter((project: ProjectWithSpent) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
        <p className="text-lg text-muted-foreground">Failed to load projects</p>
        <Button onClick={() => mutate()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage and monitor your construction projects</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Add a new construction project to your portfolio
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Downtown Office Tower"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Project description..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="client_name">Client Name</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    placeholder="e.g., ABC Corporation"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., New York, NY"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="budget">Budget *</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="e.g., 5000000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as ProjectStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{projects?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {projects?.filter((p: ProjectWithSpent) => p.status === "active").length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Active</p>
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
                <p className="text-2xl font-bold">
                  {formatCurrency(projects?.reduce((sum: number, p: ProjectWithSpent) => sum + (p.budget || 0), 0) || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Budget</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(projects?.map((p: ProjectWithSpent) => p.client_name).filter(Boolean)).size || 0}
                </p>
                <p className="text-xs text-muted-foreground">Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by creating your first project"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project: ProjectWithSpent) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description || "No description"}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(project)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                          setSelectedProject(project);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Badge className={statusColors[project.status] || statusColors.planning}>
                  {statusLabels[project.status] || project.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress || 0}%</span>
                  </div>
                  <Progress value={project.progress || 0} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{formatCurrency(project.budget || 0)}</p>
                      <p className="text-xs text-muted-foreground">Budget</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{formatCurrency(project.spent || 0)}</p>
                      <p className="text-xs text-muted-foreground">Spent</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {project.client_name && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{project.client_name}</span>
                    </div>
                  )}
                  {project.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{project.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(project.start_date)} - {formatDate(project.end_date)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the project details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Project Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-client_name">Client Name</Label>
                <Input
                  id="edit-client_name"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-start_date">Start Date *</Label>
                <Input
                  id="edit-start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-end_date">End Date</Label>
                <Input
                  id="edit-end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-budget">Budget *</Label>
                <Input
                  id="edit-budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as ProjectStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProject} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedProject?.name}&quot;? This action cannot be undone.
              All associated data including waste incidents, recommendations, and team assignments will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProject}
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}