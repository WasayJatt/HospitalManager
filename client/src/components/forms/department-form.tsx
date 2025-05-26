import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDepartmentSchema, type InsertDepartment, type Department } from "@shared/schema";
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

interface DepartmentFormProps {
  department?: Department;
  doctors: Array<{ id: number; name: string }>;
  onSubmit: (data: InsertDepartment) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function DepartmentForm({ 
  department, 
  doctors,
  onSubmit, 
  onCancel, 
  isLoading = false 
}: DepartmentFormProps) {
  const form = useForm<InsertDepartment>({
    resolver: zodResolver(insertDepartmentSchema),
    defaultValues: department ? {
      name: department.name,
      description: department.description || "",
      headDoctorId: department.headDoctorId || undefined,
    } : {
      name: "",
      description: "",
      headDoctorId: undefined,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="headDoctorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Head Doctor (Optional)</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select head doctor" />
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

        <div className="flex space-x-3 pt-4">
          <Button type="submit" className="flex-1 bg-medical-blue hover:bg-blue-700" disabled={isLoading}>
            {isLoading ? "Saving..." : department ? "Update Department" : "Add Department"}
          </Button>
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
