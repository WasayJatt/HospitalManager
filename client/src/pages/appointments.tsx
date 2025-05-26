import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import AppointmentForm from "@/components/forms/appointment-form";
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
import { Plus, Edit, Trash2, Calendar, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Appointment, Patient, Doctor, Department, InsertAppointment } from "@shared/schema";

export default function Appointments() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({ 
    queryKey: ["/api/appointments"] 
  });

  const { data: patients = [] } = useQuery<Patient[]>({ 
    queryKey: ["/api/patients"] 
  });

  const { data: doctors = [] } = useQuery<Doctor[]>({ 
    queryKey: ["/api/doctors"] 
  });

  const { data: departments = [] } = useQuery<Department[]>({ 
    queryKey: ["/api/departments"] 
  });

  const createAppointmentMutation = useMutation({
    mutationFn: (data: InsertAppointment) => apiRequest("POST", "/api/appointments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setIsFormOpen(false);
      setEditingAppointment(undefined);
      toast({
        title: "Success",
        description: "Appointment scheduled successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule appointment",
        variant: "destructive",
      });
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: InsertAppointment }) => 
      apiRequest("PUT", `/api/appointments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setIsFormOpen(false);
      setEditingAppointment(undefined);
      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    },
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/appointments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive",
      });
    },
  });

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const patient = patients.find(p => p.id === appointment.patientId);
    const doctor = doctors.find(d => d.id === appointment.doctorId);
    
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    const matchesDate = !dateFilter || appointment.appointmentDate === dateFilter;
    const matchesSearch = !searchQuery || 
      patient?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesDate && matchesSearch;
  });

  const handleSubmit = (data: InsertAppointment) => {
    if (editingAppointment) {
      updateAppointmentMutation.mutate({ id: editingAppointment.id, data });
    } else {
      createAppointmentMutation.mutate(data);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      deleteAppointmentMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPatientName = (patientId: number) => {
    return patients.find(p => p.id === patientId)?.name || 'Unknown Patient';
  };

  const getDoctorName = (doctorId: number) => {
    return doctors.find(d => d.id === doctorId)?.name || 'Unknown Doctor';
  };

  const getDepartmentName = (departmentId: number) => {
    return departments.find(d => d.id === departmentId)?.name || 'Unknown';
  };

  return (
    <MainLayout title="Appointment Management" onSearch={setSearchQuery}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-slate-900">Appointment Management</h2>
          <Button 
            onClick={() => setIsFormOpen(true)} 
            className="bg-medical-blue hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Appointment
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full md:w-48 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading appointments...
                      </TableCell>
                    </TableRow>
                  ) : filteredAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        {appointments.length === 0 ? "No appointments found" : "No appointments match your filters"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <TableRow key={appointment.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {getPatientName(appointment.patientId).charAt(0)}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-slate-900">
                                {getPatientName(appointment.patientId)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-900">
                          {getDoctorName(appointment.doctorId)}
                        </TableCell>
                        <TableCell className="text-sm text-slate-900">
                          {getDepartmentName(appointment.departmentId)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-900">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {appointment.appointmentDate}
                            </div>
                            <div className="flex items-center text-slate-500">
                              <Clock className="h-4 w-4 mr-1" />
                              {appointment.appointmentTime}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-900 max-w-xs truncate">
                          {appointment.reason}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(appointment)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(appointment.id)}
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

        {/* Appointment Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingAppointment(undefined);
        }}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment ? "Edit Appointment" : "Schedule New Appointment"}
              </DialogTitle>
            </DialogHeader>
            <AppointmentForm
              appointment={editingAppointment}
              patients={patients}
              doctors={doctors}
              departments={departments}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingAppointment(undefined);
              }}
              isLoading={createAppointmentMutation.isPending || updateAppointmentMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
