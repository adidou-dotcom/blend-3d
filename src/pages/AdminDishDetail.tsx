import { ProtectedRoute } from "@/components/ProtectedRoute";

const AdminDishDetail = () => {
  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gradient-subtle">
        <h1>Admin Dish Detail - Coming soon</h1>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDishDetail;
