import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  User,
  GraduationCap,
  Users,
  Lock,
  Eye,
  EyeOff,
  Mail,
} from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"student" | "instructor">("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const { error: registerError } = await register(
        formData.email,
        formData.password,
        role,
        formData.firstName,
        formData.lastName
      );

      if (registerError) {
        setError(registerError.message);
        setIsLoading(false);
      } else {
        alert(
          "Registration successful! Please check your email to confirm your account. After email confirmation, an administrator will need to approve your account before you can log in."
        );
        navigate("/?showLogin=true");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Semi-transparent backdrop with blur - EXACT COPY from login modal */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => navigate("/")}
      ></div>

      {/* Modal content - EXACT COPY from login modal */}
      <Card className="relative w-full max-w-md rounded-xl border bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <CardContent className="p-6">
          <div className="space-y-1 mb-6">
            <h3 className="text-2xl font-bold text-center text-black">
              Create Account
            </h3>
            <p className="text-center text-black/60">Sign up to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection - EXACT COPY from login modal */}
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

            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-black">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/40 w-4 h-4" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="pl-10 border-[#344F1F]/20 focus:border-[#F4991A] focus:ring-[#F4991A] text-black"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-black">
                  Last Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/40 w-4 h-4" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="pl-10 border-[#344F1F]/20 focus:border-[#F4991A] focus:ring-[#F4991A] text-black"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Email Field - EXACT COPY from login modal */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-black">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/40 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="pl-10 border-[#344F1F]/20 focus:border-[#F4991A] focus:ring-[#F4991A] text-black"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field - EXACT COPY from login modal */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-black">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/40 w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="pl-10 pr-10 border-[#344F1F]/20 focus:border-[#F4991A] focus:ring-[#F4991A] text-black"
                  required
                  disabled={isLoading}
                  minLength={6}
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

            {/* Confirm Password Field - EXACT COPY style from login modal */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-black">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/40 w-4 h-4" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="pl-10 pr-10 border-[#344F1F]/20 focus:border-[#F4991A] focus:ring-[#F4991A] text-black"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black/40 hover:text-black"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message - EXACT COPY from login modal */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
                {error}
              </div>
            )}

            {/* Submit Button - EXACT COPY from login modal */}
            <Button
              type="submit"
              className="w-full bg-[#344F1F] text-[#F2EAD3] hover:bg-[#344F1F]/90"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          {/* Sign In Link - EXACT COPY style from login modal */}
          <div className="mt-4 text-center">
            <p className="text-sm text-black/60">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/?showLogin=true")}
                className="text-[#F4991A] hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </div>

          {/* Close button - EXACT COPY from login modal */}
          <button
            onClick={() => navigate("/")}
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
