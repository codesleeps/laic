"use client";

// Team Management Page
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Users,
  Search,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  Building2,
  Shield,
  Edit,
  Trash2,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  projects: string[];
  status: "active" | "inactive";
  avatar?: string;
}

const sampleTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@leanbuild.com",
    phone: "+1 (555) 123-4567",
    role: "Project Manager",
    department: "Operations",
    projects: ["Downtown Office Tower", "Harbor View Complex"],
    status: "active"
  },
  {
    id: "2",
    name: "Maria Garcia",
    email: "maria.garcia@leanbuild.com",
    phone: "+1 (555) 234-5678",
    role: "Site Superintendent",
    department: "Field Operations",
    projects: ["Downtown Office Tower"],
    status: "active"
  },
  {
    id: "3",
    name: "David Lee",
    email: "david.lee@leanbuild.com",
    phone: "+1 (555) 345-6789",
    role: "Lean Consultant",
    department: "Continuous Improvement",
    projects: ["Downtown Office Tower", "Metro Station Renovation"],
    status: "active"
  },
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah.wilson@leanbuild.com",
    phone: "+1 (555) 456-7890",
    role: "Safety Manager",
    department: "HSE",
    projects: ["Harbor View Complex", "Metro Station Renovation"],
    status: "active"
  },
  {
    id: "5",
    name: "Mike Johnson",
    email: "mike.johnson@leanbuild.com",
    phone: "+1 (555) 567-8901",
    role: "Field Engineer",
    department: "Engineering",
    projects: ["Green Valley Residences"],
    status: "inactive"
  },
];

const roleColors: Record<string, string> = {
  "Project Manager": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  "Site Superintendent": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "Lean Consultant": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  "Safety Manager": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  "Field Engineer": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
};

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [teamMembers] = useState<TeamMember[]>(sampleTeamMembers);
  
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: ""
  });

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const activeMembers = teamMembers.filter(m => m.status === "active").length;
  const uniqueRoles = [...new Set(teamMembers.map(m => m.role))];

  const handleAddMember = () => {
    toast.success("Team member added successfully");
    setIsAddMemberOpen(false);
    setNewMember({ name: "", email: "", phone: "", role: "", department: "" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage your project team members and assignments</p>
        </div>
        <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Add a new member to your organization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  placeholder="e.g., John Smith"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="e.g., john@company.com"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  placeholder="e.g., +1 (555) 123-4567"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={newMember.role}
                    onValueChange={(value) => setNewMember({ ...newMember, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Project Manager">Project Manager</SelectItem>
                      <SelectItem value="Site Superintendent">Site Superintendent</SelectItem>
                      <SelectItem value="Lean Consultant">Lean Consultant</SelectItem>
                      <SelectItem value="Safety Manager">Safety Manager</SelectItem>
                      <SelectItem value="Field Engineer">Field Engineer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={newMember.department}
                    onValueChange={(value) => setNewMember({ ...newMember, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select dept" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Field Operations">Field Operations</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Continuous Improvement">Continuous Improvement</SelectItem>
                      <SelectItem value="HSE">HSE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMember}>
                Add Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
                <p className="text-xs text-muted-foreground">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeMembers}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{uniqueRoles.length}</p>
                <p className="text-xs text-muted-foreground">Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Building2 className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-xs text-muted-foreground">Departments</p>
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
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {uniqueRoles.map((role) => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Team Members Grid */}
      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No team members found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery || roleFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Start by adding your first team member"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {member.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <Badge className={roleColors[member.role] || "bg-gray-100 text-gray-800"}>
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Building2 className="h-4 w-4 mr-2" />
                        Assign to Project
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{member.department}</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-sm font-medium mb-2">Assigned Projects</p>
                  <div className="flex flex-wrap gap-1">
                    {member.projects.map((project, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {project}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Badge variant={member.status === "active" ? "default" : "secondary"}>
                    {member.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
