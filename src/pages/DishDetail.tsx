import { ProtectedRoute } from "@/components/ProtectedRoute";

const DishDetail = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-subtle">
        <h1>Dish Detail - Coming soon</h1>
      </div>
    </ProtectedRoute>
  );
};

export default DishDetail;
