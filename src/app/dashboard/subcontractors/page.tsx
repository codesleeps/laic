"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { toast } from "sonner";
import {
  Plus, Search, HardHat, Mail, Phone, Star, Shield,
  AlertTriangle, CheckCircle2, Clock, MoreHorizontal, Trash2, Edit
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useSubcontractors,
  createSubcontractor,
  updateSubcontractor,
  deleteSubcontractor,
} from "@/client-lib/api-client";
import { COMPLIANCE_STATUS_COLORS } from "@/shared/models/lean-construction";
import type { Subcontractor } from "@/shared/models/lean-construction";

type ComplianceStatus = 'pending' | 'compliant' | 'non_compliant';

export default function SubcontractorsPage() {
  const { data: subcontractors, isLoading } = useSubcontractors();
  const [searchQuery, setSearchQuery] = useState("");
  const [complianceFilter, setComplianceFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedSubcontractor, setSelectedSubcontractor] = useState<Subcontractor | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contact_name: "",
    email: "",
    phone: "",
    specialty: "",
    compliance_status: "pending" as ComplianceStatus,
    insurance_expiry: "",
    license_number: "",
    notes: "",
  });

  const filteredSubcontractors = (subcontractors || []).filter((sub) => {
    const matchesSearch = 
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.contact_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCompliance = complianceFilter === "all" || sub.compliance_status === complianceFilter;
    return matchesSearch && matchesCompliance;
  });

  const stats = {
    total: subcontractors?.length || 0,
    compliant: subcontractors?.filter(s => s.compliance_status === 'compliant').length || 0,
    pending: subcontractors?.filter(s => s.compliance_status === 'pending').length || 0,
    nonCompliant: subcontractors?.filter(s => s.compliance_status === 'non_compliant').length || 0,
  };

  const handleAddSubcontractor = async () => {
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }

    try {
      await createSubcontractor(formData);
      toast.success("Subcontractor added successfully");
      setShowAddDialog(false);
      resetForm();
    } catch {
      toast.error("Failed to add subcontractor");
    }
  };

  const handleEditSubcontractor = async () => {
    if (!selectedSubcontractor) return;

    try {
      await updateSubcontractor(selectedSubcontractor.id, formData);
      toast.success("Subcontractor updated successfully");
      setShowEditDialog(false);
      setSelectedSubcontractor(null);
      resetForm();
    } catch {
      toast.error("Failed to update subcontractor");
    }
  };

  const handleDeleteSubcontractor = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subcontractor?")) return;

    try {
      await deleteSubcontractor(id);
      toast.success("Subcontractor deleted");
    } catch {
      toast.error("Failed to delete subcontractor");
    }
  };

  const openEditDialog = (sub: Subcontractor) => {
    setSelectedSubcontractor(sub);
    setFormData({
      name: sub.name,
      contact_name: sub.contact_name || "",
      email: sub.email || "",
      phone: sub.phone || "",
      specialty: sub.specialty || "",
      compliance_status: sub.compliance_status,
      insurance_expiry: sub.insurance_expiry || "",
      license_number: sub.license_number || "",
      notes: sub.notes || "",
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      contact_name: "",
      email: "",
      phone: "",
      specialty: "",
      compliance_status: "pending",
      insurance_expiry: "",
      license_number: "",
      notes: "",
    });
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'non_compliant':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getRatingStars = (rating: number | null) => {
    if (!rating) return "Not rated";
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
        />
      );
    }
    return <div className="flex">{stars}</div>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subcontractor Management</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage subcontractor performance, compliance, and waste attribution
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subcontractor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <HardHat className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Subcontractors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.compliant}</p>
                <p className="text-sm text-muted-foreground">Compliant</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.nonCompliant}</p>
                <p className="text-sm text-muted-foreground">Non-Compliant</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subcontractors..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={complianceFilter} onValueChange={setComplianceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Compliance Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="compliant">Compliant</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="non_compliant">Non-Compliant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subcontractors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subcontractors</CardTitle>
          <CardDescription>
            {filteredSubcontractors.length} subcontractor{filteredSubcontractors.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredSubcontractors.length === 0 ? (
            <div className="text-center py-8">
              <HardHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No subcontractors found</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowAddDialog(true)}>
                Add Your First Subcontractor
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Insurance Expiry</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubcontractors.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sub.name}</p>
                        {sub.license_number && (
                          <p className="text-xs text-muted-foreground">
                            License: {sub.license_number}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {sub.contact_name && (
                          <p className="text-sm">{sub.contact_name}</p>
                        )}
                        {sub.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {sub.email}
                          </div>
                        )}
                        {sub.phone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {sub.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{sub.specialty || "General"}</TableCell>
                    <TableCell>
                      <Badge className={COMPLIANCE_STATUS_COLORS[sub.compliance_status]}>
                        {getComplianceIcon(sub.compliance_status)}
                        <span className="ml-1 capitalize">{sub.compliance_status.replace('_', '-')}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>{getRatingStars(sub.rating)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        {formatDate(sub.insurance_expiry)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(sub)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteSubcontractor(sub.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Subcontractor</DialogTitle>
            <DialogDescription>
              Add a new subcontractor to track their performance and compliance
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ABC Construction"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact Person</Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@abc.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="Electrical, Plumbing, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compliance_status">Compliance Status</Label>
                <Select
                  value={formData.compliance_status}
                  onValueChange={(value) => setFormData({ ...formData, compliance_status: value as ComplianceStatus })}
                >
                  <SelectTrigger id="compliance_status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="compliant">Compliant</SelectItem>
                    <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="license_number">License Number</Label>
                <Input
                  id="license_number"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  placeholder="LIC-123456"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance_expiry">Insurance Expiry Date</Label>
                <Input
                  id="insurance_expiry"
                  type="date"
                  value={formData.insurance_expiry}
                  onChange={(e) => setFormData({ ...formData, insurance_expiry: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this subcontractor..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleAddSubcontractor}>Add Subcontractor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Subcontractor</DialogTitle>
            <DialogDescription>
              Update subcontractor information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Company Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contact_name">Contact Person</Label>
                <Input
                  id="edit-contact_name"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-specialty">Specialty</Label>
                <Input
                  id="edit-specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-compliance_status">Compliance Status</Label>
                <Select
                  value={formData.compliance_status}
                  onValueChange={(value) => setFormData({ ...formData, compliance_status: value as ComplianceStatus })}
                >
                  <SelectTrigger id="edit-compliance_status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="compliant">Compliant</SelectItem>
                    <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-license_number">License Number</Label>
                <Input
                  id="edit-license_number"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-insurance_expiry">Insurance Expiry Date</Label>
                <Input
                  id="edit-insurance_expiry"
                  type="date"
                  value={formData.insurance_expiry}
                  onChange={(e) => setFormData({ ...formData, insurance_expiry: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); setSelectedSubcontractor(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleEditSubcontractor}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
