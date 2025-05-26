import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMedicalRecordSchema, type InsertMedicalRecord, type MedicalRecord } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface MedicalRecordFormProps {
  record?: MedicalRecord;
  patients: Array<{ id: number; name: string }>;
  doctors: Array<{ id: number; name: string }>;
  appointments: Array<{ id: number; reason: string; appointmentDate: string }>;
  onSubmit: (data: InsertMedicalRecord) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function MedicalRecordForm({ 
  record, 
  patients,
  doctors,
  appointments,
  onSubmit, 
  onCancel, 
  isLoading = false 
}: MedicalRecordFormProps) {
  const form = useForm<InsertMedicalRecord>({
    resolver: zodResolver(insertMedicalRecordSchema),
    defaultValues: record ? {
      patientId: record.patientId,
      doctorId: record.doctorId,
      appointmentId: record.appointmentId || undefined,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      medications: record.medications || "",
      notes: record.notes || "",
      recordDate: record.recordDate,
    } : {
      patientId: 0,
      doctorId: 0,
      appointmentId: undefined,
      diagnosis: "",
      treatment: "",
      medications: "",
      notes: "",
      recordDate: new Date().toISOString().split('T')[0],
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))} 
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="doctorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Doctor</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))} 
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="appointmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Related Appointment (Optional)</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select appointment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {appointments.map((appointment) => (
                    <SelectItem key={appointment.id} value={appointment.id.toString()}>
                      {appointment.reason} - {appointment.appointmentDate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="recordDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Record Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="diagnosis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diagnosis</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="treatment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Treatment</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="medications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medications</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex space-x-3 pt-4">
          <Button type="submit" className="flex-1 bg-medical-blue hover:bg-blue-700" disabled={isLoading}>
            {isLoading ? "Saving..." : record ? "Update Record" : "Add Record"}
          </Button>
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
