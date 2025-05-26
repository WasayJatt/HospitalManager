import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertDepartmentSchema, 
  insertDoctorSchema, 
  insertPatientSchema, 
  insertAppointmentSchema, 
  insertMedicalRecordSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Department routes
  app.get("/api/departments", async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.get("/api/departments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const department = await storage.getDepartment(id);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.json(department);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch department" });
    }
  });

  app.post("/api/departments", async (req, res) => {
    try {
      const department = insertDepartmentSchema.parse(req.body);
      const newDepartment = await storage.createDepartment(department);
      res.status(201).json(newDepartment);
    } catch (error) {
      res.status(400).json({ message: "Invalid department data" });
    }
  });

  app.put("/api/departments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const department = insertDepartmentSchema.partial().parse(req.body);
      const updated = await storage.updateDepartment(id, department);
      if (!updated) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Invalid department data" });
    }
  });

  app.delete("/api/departments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDepartment(id);
      if (!deleted) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete department" });
    }
  });

  // Doctor routes
  app.get("/api/doctors", async (req, res) => {
    try {
      const { departmentId } = req.query;
      let doctors;
      if (departmentId) {
        doctors = await storage.getDoctorsByDepartment(parseInt(departmentId as string));
      } else {
        doctors = await storage.getDoctors();
      }
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch doctors" });
    }
  });

  app.get("/api/doctors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const doctor = await storage.getDoctor(id);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      res.json(doctor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch doctor" });
    }
  });

  app.post("/api/doctors", async (req, res) => {
    try {
      const doctor = insertDoctorSchema.parse(req.body);
      const newDoctor = await storage.createDoctor(doctor);
      res.status(201).json(newDoctor);
    } catch (error) {
      res.status(400).json({ message: "Invalid doctor data" });
    }
  });

  app.put("/api/doctors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const doctor = insertDoctorSchema.partial().parse(req.body);
      const updated = await storage.updateDoctor(id, doctor);
      if (!updated) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Invalid doctor data" });
    }
  });

  app.delete("/api/doctors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDoctor(id);
      if (!deleted) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete doctor" });
    }
  });

  // Patient routes
  app.get("/api/patients", async (req, res) => {
    try {
      const { departmentId, search } = req.query;
      let patients;
      
      if (search) {
        patients = await storage.searchPatients(search as string);
      } else if (departmentId) {
        patients = await storage.getPatientsByDepartment(parseInt(departmentId as string));
      } else {
        patients = await storage.getPatients();
      }
      
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.get("/api/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const patient = await storage.getPatient(id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const patient = insertPatientSchema.parse(req.body);
      const newPatient = await storage.createPatient(patient);
      res.status(201).json(newPatient);
    } catch (error) {
      res.status(400).json({ message: "Invalid patient data" });
    }
  });

  app.put("/api/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const patient = insertPatientSchema.partial().parse(req.body);
      const updated = await storage.updatePatient(id, patient);
      if (!updated) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Invalid patient data" });
    }
  });

  app.delete("/api/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePatient(id);
      if (!deleted) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete patient" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", async (req, res) => {
    try {
      const { patientId, doctorId, date } = req.query;
      let appointments;
      
      if (patientId) {
        appointments = await storage.getAppointmentsByPatient(parseInt(patientId as string));
      } else if (doctorId) {
        appointments = await storage.getAppointmentsByDoctor(parseInt(doctorId as string));
      } else if (date) {
        appointments = await storage.getAppointmentsByDate(date as string);
      } else {
        appointments = await storage.getAppointments();
      }
      
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointment" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const appointment = insertAppointmentSchema.parse(req.body);
      const newAppointment = await storage.createAppointment(appointment);
      res.status(201).json(newAppointment);
    } catch (error) {
      res.status(400).json({ message: "Invalid appointment data" });
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = insertAppointmentSchema.partial().parse(req.body);
      const updated = await storage.updateAppointment(id, appointment);
      if (!updated) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Invalid appointment data" });
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAppointment(id);
      if (!deleted) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  // Medical Record routes
  app.get("/api/medical-records", async (req, res) => {
    try {
      const { patientId, doctorId } = req.query;
      let records;
      
      if (patientId) {
        records = await storage.getMedicalRecordsByPatient(parseInt(patientId as string));
      } else if (doctorId) {
        records = await storage.getMedicalRecordsByDoctor(parseInt(doctorId as string));
      } else {
        records = await storage.getMedicalRecords();
      }
      
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medical records" });
    }
  });

  app.get("/api/medical-records/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const record = await storage.getMedicalRecord(id);
      if (!record) {
        return res.status(404).json({ message: "Medical record not found" });
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medical record" });
    }
  });

  app.post("/api/medical-records", async (req, res) => {
    try {
      const record = insertMedicalRecordSchema.parse(req.body);
      const newRecord = await storage.createMedicalRecord(record);
      res.status(201).json(newRecord);
    } catch (error) {
      res.status(400).json({ message: "Invalid medical record data" });
    }
  });

  app.put("/api/medical-records/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const record = insertMedicalRecordSchema.partial().parse(req.body);
      const updated = await storage.updateMedicalRecord(id, record);
      if (!updated) {
        return res.status(404).json({ message: "Medical record not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Invalid medical record data" });
    }
  });

  app.delete("/api/medical-records/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMedicalRecord(id);
      if (!deleted) {
        return res.status(404).json({ message: "Medical record not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete medical record" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
