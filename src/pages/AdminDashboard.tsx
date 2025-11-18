import { ProtectedRoute } from "@/components/ProtectedRoute";

const AdminDashboard = () => {
  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gradient-subtle">
        <h1>Admin Dashboard - Coming soon</h1>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
