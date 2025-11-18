import { ProtectedRoute } from "@/components/ProtectedRoute";

const AdminDishes = () => {
  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gradient-subtle">
        <h1>Admin Dishes - Coming soon</h1>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDishes;
