import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole: "student" | "instructor" | "admin";
}) {
  const { user, initializing } = useAuth();

  useEffect(() => {
    console.log("🛡️ ProtectedRoute render:", {
      requiredRole,
      initializing,
      hasUser: !!user,
      userRole: user?.role,
      userId: user?.id,
    });
  }, [user, initializing, requiredRole]);

  // Wait for initial auth check to complete
  if (initializing) {
    console.log("⏳ ProtectedRoute: Still initializing auth...");
    return null; // Loading is handled by GlobalLoading component
  }

  if (!user) {
    console.log("🚫 ProtectedRoute: No user, redirecting to /");
    return <Navigate to="/" replace />;
  }

  if (user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath =
      user.role === "admin"
        ? "/admin-dashboard"
        : user.role === "instructor"
        ? "/instructor-dashboard"
        : "/student-dashboard";

    console.log("🔀 ProtectedRoute: Wrong role, redirecting to:", redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  console.log("✅ ProtectedRoute: Access granted");
  return <>{children}</>;
}
