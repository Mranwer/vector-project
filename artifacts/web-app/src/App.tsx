import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, ProtectedRoute } from "@/lib/auth";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import ServicesPage from "@/pages/services";
import ServiceDetailPage from "@/pages/service-detail";
import CategoryPage from "@/pages/category";
import DashboardPage from "@/pages/dashboard/index";
import WalletPage from "@/pages/dashboard/wallet";
import OrdersPage from "@/pages/dashboard/orders";
import ProfilePage from "@/pages/dashboard/profile";
import DashboardServicesPage from "@/pages/dashboard/services";
import AdminLoginPage from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/index";
import AdminUsersPage from "@/pages/admin/users";
import AdminServicesPage from "@/pages/admin/services";
import AdminOrdersPage from "@/pages/admin/orders";
import AdminPaymentsPage from "@/pages/admin/payments";


// Yeh do lines daalo setAuthTokenGetter ke saath
setBaseUrl("https://vector-project.onrender.com");

setAuthTokenGetter(() => {
  return localStorage.getItem("vtds_active_token");
});

setAuthTokenGetter(() => {
  return localStorage.getItem("vtds_active_token");
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/services/category/:slug" component={CategoryPage} />
      <Route path="/services/:id" component={ServiceDetailPage} />

      {/* User Dashboard */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/wallet">
        <ProtectedRoute>
          <WalletPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/orders">
        <ProtectedRoute>
          <OrdersPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/profile">
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/services">
        <ProtectedRoute>
          <DashboardServicesPage />
        </ProtectedRoute>
      </Route>

      {/* Admin */}
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin">
        <ProtectedRoute requireAdmin>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute requireAdmin>
          <AdminUsersPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/services">
        <ProtectedRoute requireAdmin>
          <AdminServicesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/orders">
        <ProtectedRoute requireAdmin>
          <AdminOrdersPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/payments">
        <ProtectedRoute requireAdmin>
          <AdminPaymentsPage />
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;