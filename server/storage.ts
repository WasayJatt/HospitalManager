import { 
  type Department, type InsertDepartment,
  type Doctor, type InsertDoctor,
  type Patient, type InsertPatient,
  type Appointment, type InsertAppointment,
  type MedicalRecord, type InsertMedicalRecord
} from "@shared/schema";

export interface IStorage {
  // Department methods
  getDepartments(): Promise<Department[]>;
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: number, department: Partial<InsertDepartment>): Promise<Department | undefined>;
  deleteDepartment(id: number): Promise<boolean>;

  // Doctor methods
  getDoctors(): Promise<Doctor[]>;
  getDoctor(id: number): Promise<Doctor | undefined>;
  getDoctorsByDepartment(departmentId: number): Promise<Doctor[]>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  updateDoctor(id: number, doctor: Partial<InsertDoctor>): Promise<Doctor | undefined>;
  deleteDoctor(id: number): Promise<boolean>;

  // Patient methods
  getPatients(): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientsByDepartment(departmentId: number): Promise<Patient[]>;
  searchPatients(query: string): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  deletePatient(id: number): Promise<boolean>;

  // Appointment methods
  getAppointments(): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByPatient(patientId: number): Promise<Appointment[]>;
  getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;

  // Medical Record methods
  getMedicalRecords(): Promise<MedicalRecord[]>;
  getMedicalRecord(id: number): Promise<MedicalRecord | undefined>;
  getMedicalRecordsByPatient(patientId: number): Promise<MedicalRecord[]>;
  getMedicalRecordsByDoctor(doctorId: number): Promise<MedicalRecord[]>;
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;
  updateMedicalRecord(id: number, record: Partial<InsertMedicalRecord>): Promise<MedicalRecord | undefined>;
  deleteMedicalRecord(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private departments: Map<number, Department> = new Map();
  private doctors: Map<number, Doctor> = new Map();
  private patients: Map<number, Patient> = new Map();
  private appointments: Map<number, Appointment> = new Map();
  private medicalRecords: Map<number, MedicalRecord> = new Map();
  
  private departmentId = 1;
  private doctorId = 1;
  private patientId = 1;
  private appointmentId = 1;
  private medicalRecordId = 1;

  constructor() {
    // Initialize with some default departments
    this.initializeData();
  }

  private initializeData() {
    // Create departments
    const cardiology: Department = { id: 1, name: "Cardiology", description: "Heart and cardiovascular care", headDoctorId: null };
    const pediatrics: Department = { id: 2, name: "Pediatrics", description: "Children's healthcare", headDoctorId: null };
    const orthopedics: Department = { id: 3, name: "Orthopedics", description: "Bone and joint care", headDoctorId: null };
    const neurology: Department = { id: 4, name: "Neurology", description: "Brain and nervous system", headDoctorId: null };
    
    this.departments.set(1, cardiology);
    this.departments.set(2, pediatrics);
    this.departments.set(3, orthopedics);
    this.departments.set(4, neurology);
    this.departmentId = 5;
  }

  // Department methods
  async getDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    return this.departments.get(id);
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const newDepartment: Department = { ...department, id: this.departmentId++ };
    this.departments.set(newDepartment.id, newDepartment);
    return newDepartment;
  }

  async updateDepartment(id: number, department: Partial<InsertDepartment>): Promise<Department | undefined> {
    const existing = this.departments.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...department };
    this.departments.set(id, updated);
    return updated;
  }

  async deleteDepartment(id: number): Promise<boolean> {
    return this.departments.delete(id);
  }

  // Doctor methods
  async getDoctors(): Promise<Doctor[]> {
    return Array.from(this.doctors.values());
  }

  async getDoctor(id: number): Promise<Doctor | undefined> {
    return this.doctors.get(id);
  }

  async getDoctorsByDepartment(departmentId: number): Promise<Doctor[]> {
    return Array.from(this.doctors.values()).filter(doctor => doctor.departmentId === departmentId);
  }

  async createDoctor(doctor: InsertDoctor): Promise<Doctor> {
    const newDoctor: Doctor = { ...doctor, id: this.doctorId++ };
    this.doctors.set(newDoctor.id, newDoctor);
    return newDoctor;
  }

  async updateDoctor(id: number, doctor: Partial<InsertDoctor>): Promise<Doctor | undefined> {
    const existing = this.doctors.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...doctor };
    this.doctors.set(id, updated);
    return updated;
  }

  async deleteDoctor(id: number): Promise<boolean> {
    return this.doctors.delete(id);
  }

  // Patient methods
  async getPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getPatientsByDepartment(departmentId: number): Promise<Patient[]> {
    return Array.from(this.patients.values()).filter(patient => patient.departmentId === departmentId);
  }

  async searchPatients(query: string): Promise<Patient[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.patients.values()).filter(patient =>
      patient.name.toLowerCase().includes(lowercaseQuery) ||
      patient.email.toLowerCase().includes(lowercaseQuery) ||
      patient.phone.includes(query) ||
      patient.id.toString().includes(query)
    );
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const newPatient: Patient = { ...patient, id: this.patientId++ };
    this.patients.set(newPatient.id, newPatient);
    return newPatient;
  }

  async updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined> {
    const existing = this.patients.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...patient };
    this.patients.set(id, updated);
    return updated;
  }

  async deletePatient(id: number): Promise<boolean> {
    return this.patients.delete(id);
  }

  // Appointment methods
  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(appointment => appointment.patientId === patientId);
  }

  async getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(appointment => appointment.doctorId === doctorId);
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(appointment => appointment.appointmentDate === date);
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const newAppointment: Appointment = { ...appointment, id: this.appointmentId++ };
    this.appointments.set(newAppointment.id, newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const existing = this.appointments.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...appointment };
    this.appointments.set(id, updated);
    return updated;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }

  // Medical Record methods
  async getMedicalRecords(): Promise<MedicalRecord[]> {
    return Array.from(this.medicalRecords.values());
  }

  async getMedicalRecord(id: number): Promise<MedicalRecord | undefined> {
    return this.medicalRecords.get(id);
  }

  async getMedicalRecordsByPatient(patientId: number): Promise<MedicalRecord[]> {
    return Array.from(this.medicalRecords.values()).filter(record => record.patientId === patientId);
  }

  async getMedicalRecordsByDoctor(doctorId: number): Promise<MedicalRecord[]> {
    return Array.from(this.medicalRecords.values()).filter(record => record.doctorId === doctorId);
  }

  async createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord> {
    const newRecord: MedicalRecord = { ...record, id: this.medicalRecordId++ };
    this.medicalRecords.set(newRecord.id, newRecord);
    return newRecord;
  }

  async updateMedicalRecord(id: number, record: Partial<InsertMedicalRecord>): Promise<MedicalRecord | undefined> {
    const existing = this.medicalRecords.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...record };
    this.medicalRecords.set(id, updated);
    return updated;
  }

  async deleteMedicalRecord(id: number): Promise<boolean> {
    return this.medicalRecords.delete(id);
  }
}

export const storage = new MemStorage();
