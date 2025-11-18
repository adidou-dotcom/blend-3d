import { ProtectedRoute } from "@/components/ProtectedRoute";

const Profile = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-subtle">
        <h1>Profile - Coming soon</h1>
      </div>
    </ProtectedRoute>
  );
};

export default Profile;
