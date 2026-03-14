import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "@/lib/i18n";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Index from "./pages/Index";
import UnitsMonitor from "./pages/UnitsMonitor";
import Tenants from "./pages/Tenants";
import Financials from "./pages/Financials";
import Cheques from "./pages/Cheques";
import Reports from "./pages/Reports";
import Contracts from "./pages/Contracts";
import MaintenancePage from "./pages/Maintenance";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={<Index />} />
            <Route path="/units-monitor" element={<UnitsMonitor />} />
            <Route path="/properties" element={<UnitsMonitor />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/financials" element={<Financials />} />
            <Route path="/cheques" element={<Cheques />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
