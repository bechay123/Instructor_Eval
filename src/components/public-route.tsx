import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuth();

  useEffect(() => {
    console.log("🌐 PublicRoute render:", {
      initializing,
      hasUser: !!user,
      userRole: user?.role,
    });
  }, [user, initializing]);

  // Wait for initial auth check to complete
  if (initializing) {
    console.log("⏳ PublicRoute: Still initializing auth...");
    return null; // Loading is handled by GlobalLoading component
  }

  // If user is logged in, redirect to their dashboard
  if (user) {
    const redirectPath =
      user.role === "admin"
        ? "/admin-dashboard"
        : user.role === "instructor"
        ? "/instructor-dashboard"
        : "/student-dashboard";

    console.log("🔀 PublicRoute: User logged in, redirecting to:", redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  // If not logged in, show the public page
  console.log("✅ PublicRoute: No user, showing public page");
  return <>{children}</>;
}
