import { Link, useLocation } from "wouter";
import { 
  Home, 
  Users, 
  UserCheck, 
  Calendar, 
  FileText, 
  Building, 
  Settings,
  Activity
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Doctors", href: "/doctors", icon: UserCheck },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Medical Records", href: "/medical-records", icon: FileText },
  { name: "Departments", href: "/departments", icon: Building },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg border-r border-slate-200 flex flex-col">
      {/* Logo Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-medical-blue rounded-lg flex items-center justify-center">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">MediCare HMS</h1>
            <p className="text-xs text-slate-500">Hospital Management</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <div className="mb-4">
          <p className="px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Main Menu</p>
        </div>
        
        {navigation.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.name} href={item.href}>
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive 
                  ? "bg-medical-blue text-white" 
                  : "text-slate-700 hover:bg-slate-100"
              }`}>
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
            <UserCheck className="h-4 w-4 text-slate-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">Dr. Sarah Johnson</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
          <button className="text-slate-400 hover:text-slate-600">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
