import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import MedicalRecordForm from "@/components/forms/medical-record-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Plus, Edit, Trash2, FileText, User, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { MedicalRecord, Patient, Doctor, Appointment, InsertMedicalRecord } from "@shared/schema";

export default function MedicalRecords() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [patientFilter, setPatientFilter] = useState<string>("all");
  const [doctorFilter, setDoctorFilter] = useState<string>("all");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: records = [], isLoading } = useQuery<MedicalRecord[]>({ 
    queryKey: ["/api/medical-records"] 
  });

  const { data: patients = [] } = useQuery<Patient[]>({ 
    queryKey: ["/api/patients"] 
  });

  const { data: doctors = [] } = useQuery<Doctor[]>({ 
    queryKey: ["/api/doctors"] 
  });

  const { data: appointments = [] } = useQuery<Appointment[]>({ 
    queryKey: ["/api/appointments"] 
  });

  const createRecordMutation = useMutation({
    mutationFn: (data: InsertMedicalRecord) => apiRequest("POST", "/api/medical-records", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical-records"] });
      setIsFormOpen(false);
      setEditingRecord(undefined);
      toast({
        title: "Success",
        description: "Medical record created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create medical record",
        variant: "destructive",
      });
    },
  });

  const updateRecordMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: InsertMedicalRecord }) => 
      apiRequest("PUT", `/api/medical-records/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical-records"] });
      setIsFormOpen(false);
      setEditingRecord(undefined);
      toast({
        title: "Success",
        description: "Medical record updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update medical record",
        variant: "destructive",
      });
    },
  });

  const deleteRecordMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/medical-records/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical-records"] });
      toast({
        title: "Success",
        description: "Medical record deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete medical record",
        variant: "destructive",
      });
    },
  });

  // Filter records
  const filteredRecords = records.filter(record => {
    const patient = patients.find(p => p.id === record.patientId);
    const doctor = doctors.find(d => d.id === record.doctorId);
    
    const matchesPatient = patientFilter === "all" || record.patientId.toString() === patientFilter;
    const matchesDoctor = doctorFilter === "all" || record.doctorId.toString() === doctorFilter;
    const matchesSearch = !searchQuery || 
      patient?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.treatment.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesPatient && matchesDoctor && matchesSearch;
  });

  const handleSubmit = (data: InsertMedicalRecord) => {
    if (editingRecord) {
      updateRecordMutation.mutate({ id: editingRecord.id, data });
    } else {
      createRecordMutation.mutate(data);
    }
  };

  const handleEdit = (record: MedicalRecord) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this medical record?")) {
      deleteRecordMutation.mutate(id);
    }
  };

  const getPatientName = (patientId: number) => {
    return patients.find(p => p.id === patientId)?.name || 'Unknown Patient';
  };

  const getDoctorName = (doctorId: number) => {
    return doctors.find(d => d.id === doctorId)?.name || 'Unknown Doctor';
  };

  return (
    <MainLayout title="Medical Records" onSearch={setSearchQuery}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-slate-900">Medical Records</h2>
          <Button 
            onClick={() => setIsFormOpen(true)} 
            className="bg-medical-blue hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Medical Record
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={patientFilter} onValueChange={setPatientFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Patients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patients</SelectItem>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Doctors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Treatment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading medical records...
                      </TableCell>
                    </TableRow>
                  ) : filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        {records.length === 0 ? "No medical records found" : "No records match your filters"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-slate-900">
                                {getPatientName(record.patientId)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-900">
                          {getDoctorName(record.doctorId)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-slate-900">
                            <Calendar className="h-4 w-4 mr-1" />
                            {record.recordDate}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-900 max-w-xs">
                          <div className="truncate" title={record.diagnosis}>
                            {record.diagnosis}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-900 max-w-xs">
                          <div className="truncate" title={record.treatment}>
                            {record.treatment}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(record.id)}
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

        {/* Medical Record Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingRecord(undefined);
        }}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? "Edit Medical Record" : "Add New Medical Record"}
              </DialogTitle>
            </DialogHeader>
            <MedicalRecordForm
              record={editingRecord}
              patients={patients}
              doctors={doctors}
              appointments={appointments}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingRecord(undefined);
              }}
              isLoading={createRecordMutation.isPending || updateRecordMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
