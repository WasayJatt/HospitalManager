import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import DepartmentForm from "@/components/forms/department-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Building, Users, UserCheck } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Department, Doctor, Patient, InsertDepartment } from "@shared/schema";

export default function Departments() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: departments = [], isLoading } = useQuery<Department[]>({ 
    queryKey: ["/api/departments"] 
  });

  const { data: doctors = [] } = useQuery<Doctor[]>({ 
    queryKey: ["/api/doctors"] 
  });

  const { data: patients = [] } = useQuery<Patient[]>({ 
    queryKey: ["/api/patients"] 
  });

  const createDepartmentMutation = useMutation({
    mutationFn: (data: InsertDepartment) => apiRequest("POST", "/api/departments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      setIsFormOpen(false);
      setEditingDepartment(undefined);
      toast({
        title: "Success",
        description: "Department created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create department",
        variant: "destructive",
      });
    },
  });

  const updateDepartmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: InsertDepartment }) => 
      apiRequest("PUT", `/api/departments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      setIsFormOpen(false);
      setEditingDepartment(undefined);
      toast({
        title: "Success",
        description: "Department updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update department",
        variant: "destructive",
      });
    },
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/departments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      toast({
        title: "Success",
        description: "Department deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete department",
        variant: "destructive",
      });
    },
  });

  // Filter departments based on search
  const filteredDepartments = departments.filter(department => 
    department.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (department.description && department.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSubmit = (data: InsertDepartment) => {
    if (editingDepartment) {
      updateDepartmentMutation.mutate({ id: editingDepartment.id, data });
    } else {
      createDepartmentMutation.mutate(data);
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    const hasStaff = doctors.some(d => d.departmentId === id) || patients.some(p => p.departmentId === id);
    
    if (hasStaff) {
      toast({
        title: "Cannot Delete Department",
        description: "This department has associated doctors or patients. Please reassign them first.",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm("Are you sure you want to delete this department?")) {
      deleteDepartmentMutation.mutate(id);
    }
  };

  const getDepartmentStats = (departmentId: number) => {
    const departmentDoctors = doctors.filter(d => d.departmentId === departmentId);
    const departmentPatients = patients.filter(p => p.departmentId === departmentId);
    const headDoctor = departments.find(d => d.id === departmentId)?.headDoctorId 
      ? doctors.find(d => d.id === departments.find(dept => dept.id === departmentId)?.headDoctorId)
      : null;

    return {
      doctorCount: departmentDoctors.length,
      patientCount: departmentPatients.length,
      headDoctor: headDoctor?.name || 'Not assigned'
    };
  };

  return (
    <MainLayout title="Department Management" onSearch={setSearchQuery}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-slate-900">Department Management</h2>
          <Button 
            onClick={() => setIsFormOpen(true)} 
            className="bg-medical-blue hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Department
          </Button>
        </div>

        {/* Departments Grid */}
        {isLoading ? (
          <div className="text-center py-8">Loading departments...</div>
        ) : filteredDepartments.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            {departments.length === 0 ? "No departments found" : "No departments match your search"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.map((department) => {
              const stats = getDepartmentStats(department.id);
              
              return (
                <Card key={department.id} className="border border-slate-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-medical-blue rounded-lg flex items-center justify-center">
                          <Building className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{department.name}</CardTitle>
                          <p className="text-sm text-slate-500 mt-1">
                            Head: {stats.headDoctor}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(department)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(department.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {department.description && (
                      <p className="text-sm text-slate-600 mb-4">
                        {department.description}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <UserCheck className="h-4 w-4 text-blue-600 mr-1" />
                          <span className="text-sm font-medium text-blue-900">Doctors</span>
                        </div>
                        <p className="text-xl font-semibold text-blue-700">{stats.doctorCount}</p>
                      </div>
                      
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <Users className="h-4 w-4 text-green-600 mr-1" />
                          <span className="text-sm font-medium text-green-900">Patients</span>
                        </div>
                        <p className="text-xl font-semibold text-green-700">{stats.patientCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Department Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingDepartment(undefined);
        }}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDepartment ? "Edit Department" : "Add New Department"}
              </DialogTitle>
            </DialogHeader>
            <DepartmentForm
              department={editingDepartment}
              doctors={doctors}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingDepartment(undefined);
              }}
              isLoading={createDepartmentMutation.isPending || updateDepartmentMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
