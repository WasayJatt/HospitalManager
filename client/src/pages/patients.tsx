import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import PatientForm from "@/components/forms/patient-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Plus, Eye, Edit, Trash2, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Patient, Department, InsertPatient } from "@shared/schema";

export default function Patients() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patients = [], isLoading } = useQuery<Patient[]>({ 
    queryKey: ["/api/patients", { search: searchQuery || undefined }],
  });

  const { data: departments = [] } = useQuery<Department[]>({ 
    queryKey: ["/api/departments"] 
  });

  const createPatientMutation = useMutation({
    mutationFn: (data: InsertPatient) => apiRequest("POST", "/api/patients", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setIsFormOpen(false);
      setEditingPatient(undefined);
      toast({
        title: "Success",
        description: "Patient created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create patient",
        variant: "destructive",
      });
    },
  });

  const updatePatientMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: InsertPatient }) => 
      apiRequest("PUT", `/api/patients/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setIsFormOpen(false);
      setEditingPatient(undefined);
      toast({
        title: "Success",
        description: "Patient updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update patient",
        variant: "destructive",
      });
    },
  });

  const deletePatientMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/patients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete patient",
        variant: "destructive",
      });
    },
  });

  // Filter patients based on search and filters
  const filteredPatients = patients.filter(patient => {
    const matchesDepartment = departmentFilter === "all" || patient.departmentId.toString() === departmentFilter;
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter;
    return matchesDepartment && matchesStatus;
  });

  const handleSubmit = (data: InsertPatient) => {
    if (editingPatient) {
      updatePatientMutation.mutate({ id: editingPatient.id, data });
    } else {
      createPatientMutation.mutate(data);
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      deletePatientMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'discharged': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDepartmentName = (departmentId: number) => {
    return departments.find(d => d.id === departmentId)?.name || 'Unknown';
  };

  return (
    <MainLayout title="Patient Management" onSearch={setSearchQuery}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-slate-900">Patient Management</h2>
          <Button 
            onClick={() => setIsFormOpen(true)} 
            className="bg-medical-blue hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Patient
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="discharged">Discharged</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Patient</TableHead>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading patients...
                      </TableCell>
                    </TableRow>
                  ) : filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        {patients.length === 0 ? "No patients found" : "No patients match your filters"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map((patient) => (
                      <TableRow key={patient.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-medical-blue rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {patient.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-900">{patient.name}</div>
                              <div className="text-sm text-slate-500">{patient.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-900">P-{patient.id.toString().padStart(6, '0')}</TableCell>
                        <TableCell className="text-sm text-slate-900">{patient.age}</TableCell>
                        <TableCell className="text-sm text-slate-900">{getDepartmentName(patient.departmentId)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(patient.status)}>
                            {patient.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(patient)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(patient.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Patient Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingPatient(undefined);
        }}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPatient ? "Edit Patient" : "Add New Patient"}
              </DialogTitle>
            </DialogHeader>
            <PatientForm
              patient={editingPatient}
              departments={departments}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingPatient(undefined);
              }}
              isLoading={createPatientMutation.isPending || updatePatientMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
