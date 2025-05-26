import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Departments table
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  headDoctorId: integer("head_doctor_id"),
});

// Doctors table
export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  specialization: text("specialization").notNull(),
  departmentId: integer("department_id").notNull(),
  experience: integer("experience").notNull(),
  status: text("status").notNull().default("active"), // active, inactive
});

// Patients table
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(), // male, female, other
  address: text("address"),
  departmentId: integer("department_id").notNull(),
  status: text("status").notNull().default("active"), // active, discharged, critical
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  departmentId: integer("department_id").notNull(),
  appointmentDate: text("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  notes: text("notes"),
});

// Medical Records table
export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  appointmentId: integer("appointment_id"),
  diagnosis: text("diagnosis").notNull(),
  treatment: text("treatment").notNull(),
  medications: text("medications"),
  notes: text("notes"),
  recordDate: text("record_date").notNull(),
});

// Insert schemas
export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
});

export const insertDoctorSchema = createInsertSchema(doctors).omit({
  id: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
});

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({
  id: true,
});

// Types
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
