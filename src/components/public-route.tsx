import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuth();
  const [readyToRedirect, setReadyToRedirect] = useState(false);

  useEffect(() => {
    console.log("🌐 PublicRoute render:", {
      initializing,
      hasUser: !!user,
      userRole: user?.role,
    });

    // When user logs in, show landing page briefly before redirecting
    if (user && !initializing) {
      // Wait 1 second to show landing page, then redirect
      const timer = setTimeout(() => {
        setReadyToRedirect(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, initializing]);

  // Wait for initial auth check to complete
  if (initializing) {
    console.log("⏳ PublicRoute: Still initializing auth...");
    return null; // Loading is handled by GlobalLoading component
  }

  // If user is logged in and ready to redirect
  if (user && readyToRedirect) {
    const redirectPath =
      user.role === "admin"
        ? "/admin-dashboard"
        : user.role === "instructor"
        ? "/instructor-dashboard"
        : "/student-dashboard";

    console.log("🔀 PublicRoute: Redirecting to:", redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  // Show landing page (either for logged out users or briefly for logged in users)
  console.log("✅ PublicRoute: Showing public page");
  return <>{children}</>;
}
