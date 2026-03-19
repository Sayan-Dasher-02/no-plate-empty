import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import DonorDashboard from "./pages/DonorDashboard";
import DonorDetailsPage from "./pages/DonorDetailsPage";
import FoodDetailsPage from "./pages/FoodDetailsPage";
import NgoDashboard from "./pages/NgoDashboard";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/routes/ProtectedRoute";
import PublicRoute from "@/routes/PublicRoute";

const queryClient = new QueryClient();



const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/admin/login"
              element={
                <PublicRoute>
                  <AdminLogin />
                </PublicRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account/settings"
              element={
                <ProtectedRoute>
                  <AccountSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                  <Navigate to="/admin/dashboard" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/dashboard"
              element={<Navigate to="/donor/home" replace />}
            />
            <Route
              path="/donor/home"
              element={
                <ProtectedRoute allowedRoles={["DONOR"]}>
                  <DonorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/dashboard"
              element={<Navigate to="/recipient/home" replace />}
            />
            <Route
              path="/recipient/home"
              element={
                <ProtectedRoute allowedRoles={["NGO"]}>
                  <NgoDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/foods/:id" element={<FoodDetailsPage />} />
            <Route path="/donors/:id" element={<DonorDetailsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
