import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Patients from "@/pages/patients";
import Doctors from "@/pages/doctors";
import Appointments from "@/pages/appointments";
import MedicalRecords from "@/pages/medical-records";
import Departments from "@/pages/departments";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/patients" component={Patients} />
      <Route path="/doctors" component={Doctors} />
      <Route path="/appointments" component={Appointments} />
      <Route path="/medical-records" component={MedicalRecords} />
      <Route path="/departments" component={Departments} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
