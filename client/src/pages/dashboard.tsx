import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, Calendar, Building, TrendingUp, Clock } from "lucide-react";
import type { Patient, Doctor, Appointment, Department } from "@shared/schema";

export default function Dashboard() {
  const { data: patients = [] } = useQuery<Patient[]>({ queryKey: ["/api/patients"] });
  const { data: doctors = [] } = useQuery<Doctor[]>({ queryKey: ["/api/doctors"] });
  const { data: appointments = [] } = useQuery<Appointment[]>({ queryKey: ["/api/appointments"] });
  const { data: departments = [] } = useQuery<Department[]>({ queryKey: ["/api/departments"] });

  // Calculate today's date for filtering
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => apt.appointmentDate === today);
  const activeDoctors = doctors.filter(doc => doc.status === 'active');

  const stats = [
    {
      title: "Total Patients",
      value: patients.length,
      change: "+12.5%",
      changeType: "positive" as const,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Active Doctors",
      value: activeDoctors.length,
      change: "+3",
      changeType: "positive" as const,
      icon: UserCheck,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Today's Appointments",
      value: todayAppointments.length,
      change: "23 pending",
      changeType: "neutral" as const,
      icon: Calendar,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Departments",
      value: departments.length,
      change: "All active",
      changeType: "positive" as const,
      icon: Building,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  // Recent appointments for today
  const recentAppointments = todayAppointments.slice(0, 5);

  return (
    <MainLayout title="Dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className={`font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 
                  'text-slate-500'
                }`}>
                  {stat.change}
                </span>
                {stat.changeType !== 'neutral' && (
                  <span className="text-slate-500 ml-2">vs last month</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-slate-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Today's Appointments</h3>
            <div className="space-y-4">
              {recentAppointments.length > 0 ? (
                recentAppointments.map((appointment) => {
                  const patient = patients.find(p => p.id === appointment.patientId);
                  const doctor = doctors.find(d => d.id === appointment.doctorId);
                  
                  return (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {patient?.name.charAt(0) || 'P'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {patient?.name || 'Unknown Patient'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {doctor?.name || 'Unknown Doctor'} - {appointment.reason}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-slate-600">{appointment.appointmentTime}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2 group-hover:text-blue-600" />
                <p className="text-sm font-medium text-slate-700">Add Patient</p>
              </button>
              <button className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group">
                <Calendar className="h-8 w-8 text-green-500 mx-auto mb-2 group-hover:text-green-600" />
                <p className="text-sm font-medium text-slate-700">Schedule Appointment</p>
              </button>
              <button className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group">
                <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2 group-hover:text-purple-600" />
                <p className="text-sm font-medium text-slate-700">Add Record</p>
              </button>
              <button className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors group">
                <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2 group-hover:text-yellow-600" />
                <p className="text-sm font-medium text-slate-700">Search Records</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
