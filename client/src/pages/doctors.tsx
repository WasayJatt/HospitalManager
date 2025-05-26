import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import DoctorForm from "@/components/forms/doctor-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Mail, Phone, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Doctor, Department, InsertDoctor } from "@shared/schema";

export default function Doctors() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: doctors = [], isLoading } = useQuery<Doctor[]>({ 
    queryKey: ["/api/doctors"] 
  });

  const { data: departments = [] } = useQuery<Department[]>({ 
    queryKey: ["/api/departments"] 
  });

  const createDoctorMutation = useMutation({
    mutationFn: (data: InsertDoctor) => apiRequest("POST", "/api/doctors", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctors"] });
      setIsFormOpen(false);
      setEditingDoctor(undefined);
      toast({
        title: "Success",
        description: "Doctor created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create doctor",
        variant: "destructive",
      });
    },
  });

  const updateDoctorMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: InsertDoctor }) => 
      apiRequest("PUT", `/api/doctors/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctors"] });
      setIsFormOpen(false);
      setEditingDoctor(undefined);
      toast({
        title: "Success",
        description: "Doctor updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update doctor",
        variant: "destructive",
      });
    },
  });

  const deleteDoctorMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/doctors/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctors"] });
      toast({
        title: "Success",
        description: "Doctor deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete doctor",
        variant: "destructive",
      });
    },
  });

  // Filter doctors based on search
  const filteredDoctors = doctors.filter(doctor => 
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (data: InsertDoctor) => {
    if (editingDoctor) {
      updateDoctorMutation.mutate({ id: editingDoctor.id, data });
    } else {
      createDoctorMutation.mutate(data);
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      deleteDoctorMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDepartmentName = (departmentId: number) => {
    return departments.find(d => d.id === departmentId)?.name || 'Unknown';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase();
  };

  return (
    <MainLayout title="Doctor Management" onSearch={setSearchQuery}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-slate-900">Doctor Management</h2>
          <Button 
            onClick={() => setIsFormOpen(true)} 
            className="bg-medical-blue hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Doctor
          </Button>
        </div>

        {/* Doctors Grid */}
        {isLoading ? (
          <div className="text-center py-8">Loading doctors...</div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            {doctors.length === 0 ? "No doctors found" : "No doctors match your search"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="border border-slate-200">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 bg-medical-blue rounded-full mx-auto flex items-center justify-center mb-3">
                      <span className="text-white text-lg font-medium">
                        {getInitials(doctor.name)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{doctor.name}</h3>
                    <p className="text-sm text-slate-500">{doctor.specialization}</p>
                    <Badge className={`mt-2 ${getStatusColor(doctor.status)}`}>
                      {doctor.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-slate-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {doctor.email}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {doctor.phone}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {doctor.experience} years experience
                    </div>
                    <div className="text-sm text-slate-600">
                      <strong>Department:</strong> {getDepartmentName(doctor.departmentId)}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 text-medical-blue border-medical-blue hover:bg-blue-50"
                    >
                      View Schedule
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(doctor)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(doctor.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Doctor Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingDoctor(undefined);
        }}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
              </DialogTitle>
            </DialogHeader>
            <DoctorForm
              doctor={editingDoctor}
              departments={departments}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingDoctor(undefined);
              }}
              isLoading={createDoctorMutation.isPending || updateDoctorMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
