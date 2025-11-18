import { ProtectedRoute } from "@/components/ProtectedRoute";

const CreateDish = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-subtle">
        <h1>Create Dish - Coming soon</h1>
      </div>
    </ProtectedRoute>
  );
};

export default CreateDish;
