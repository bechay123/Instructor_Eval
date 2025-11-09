import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, Users, User, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "instructor">("student");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    console.log("Login process starting...");
    try {
      console.log("Attempting login with:", { email: loginEmail, role });

      const { error, role: userRole } = await login(loginEmail, password);
      console.log("Login response:", { error, userRole });

      if (error) {
        console.error("Login error:", error);
        setError(error.message);
        setIsLoading(false);
        return;
      }

      if (!userRole) {
        console.error("No role returned");
        setError("Failed to determine user role");
        setIsLoading(false);
        return;
      }

      console.log("User role from database:", userRole);
      console.log("Selected role in modal:", role);

      // Verify role matches (admins can log in with any role selection)
      if (userRole !== "admin") {
        if (userRole !== role) {
          console.error("Role mismatch:", { userRole, selectedRole: role });
          setError(
            `This account is registered as a ${userRole}. Please select the correct role.`
          );
          setIsLoading(false);
          return;
        }
      }

      console.log("Login successful, redirecting to:", userRole);

      // Redirect based on role
      let redirectPath = "/";
      switch (userRole) {
        case "admin":
          redirectPath = "/admin-dashboard";
          break;
        case "instructor":
          redirectPath = "/instructor-dashboard";
          break;
        case "student":
          redirectPath = "/student-dashboard";
          break;
        default:
          setError("Invalid role");
          setIsLoading(false);
          return;
      }

      console.log("Navigating to:", redirectPath);

      // Close modal and clear form first
      onClose();
      setLoginEmail("");
      setPassword("");

      // Wait a bit for auth state to settle, then navigate
      setTimeout(() => {
        navigate(redirectPath);
        setIsLoading(false);
      }, 300);
    } catch (err: any) {
      console.error("Unexpected error during login:", err);
      setError(err.message || "An unexpected error occurred during login");
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Semi-transparent backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal content */}
      <Card className="relative w-full max-w-md rounded-xl border bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <CardContent className="p-6">
          <div className="space-y-1 mb-6">
            <h3 className="text-2xl font-bold text-center text-black">
              Welcome Back
            </h3>
            <p className="text-center text-black/60">
              Sign in to your account to continue
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-black">I am a:</Label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    role === "student"
                      ? "border-[#344F1F] bg-[#344F1F]/5 text-[#344F1F]"
                      : "border-gray-200 text-black/60 hover:border-[#344F1F]/30"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole("instructor")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    role === "instructor"
                      ? "border-[#344F1F] bg-[#344F1F]/5 text-[#344F1F]"
                      : "border-gray-200 text-black/60 hover:border-[#344F1F]/30"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Instructor
                </button>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-black">
                Email
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/40 w-4 h-4" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="pl-10 border-[#344F1F]/20 focus:border-[#F4991A] focus:ring-[#F4991A] text-black"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-black">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/40 w-4 h-4" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 border-[#344F1F]/20 focus:border-[#F4991A] focus:ring-[#F4991A] text-black"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black/40 hover:text-black"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#344F1F] text-[#F2EAD3] hover:bg-[#344F1F]/90"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Create Account Link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-black/60">
              Don't have an account?{" "}
              <button
                onClick={() => {
                  onClose();
                  navigate("/register");
                }}
                className="text-[#F4991A] hover:underline font-medium"
              >
                Create one now
              </button>
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-black/40 hover:text-black"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
