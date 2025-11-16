"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/supabase-client";
import { BilingualComment } from "@/components/bilingual-comment";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Star,
  TrendingUp,
  Users,
  MessageSquare,
  LogOut,
  BarChart3,
  Award,
  Brain,
  Sparkles,
  UserCircle,
  X,
  Save,
  UserPlus,
  Trash2,
  Search,
  Lightbulb,
  ThumbsUp,
  AlertCircle,
  TrendingDown,
} from "lucide-react";
import { generateAIAnalysis, saveAIReport } from "@/services/openai-service";
import type { AIAnalysisResult } from "@/services/openai-service";

interface Course {
  id: string;
  code: string;
  name: string;
  academic_term_id: string;
}

interface InstructorProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
}

interface InstructorDetails {
  department: string;
  office_location: string | null;
  specialization: string[] | null;
  academic_rank: string | null;
}

interface EvaluationData {
  totalEvaluations: number;
  overallRating: number;
  responseRate: number;
  categoryAverages: {
    teaching: number;
    materials: number;
    communication: number;
  };
  comments: Array<{
    teaching_comments: string;
    materials_comments: string;
    communication_comments: string;
    general_comments: string;
    teaching_comments_original?: string;
    teaching_comments_language?: string;
    materials_comments_original?: string;
    materials_comments_language?: string;
    communication_comments_original?: string;
    communication_comments_language?: string;
    general_comments_original?: string;
    general_comments_language?: string;
  }>;
  detailedRatings: {
    teaching_clarity: number[];
    teaching_engagement: number[];
    teaching_knowledge: number[];
    teaching_organization: number[];
    teaching_feedback: number[];
    materials_quality: number[];
    materials_relevance: number[];
    materials_accessibility: number[];
    materials_variety: number[];
    materials_timeliness: number[];
    communication_availability: number[];
    communication_responsiveness: number[];
    communication_clarity: number[];
    communication_helpfulness: number[];
    communication_approachability: number[];
  };
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  student_details: {
    student_number: string;
    program: string;
    year_level: number;
  } | null;
}

interface Enrollment {
  id: string;
  student_id: string;
  enrollment_date: string;
  status: string;
  student: Student;
}

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState<{
    profile: InstructorProfile | null;
    details: InstructorDetails | null;
  }>({
    profile: null,
    details: null,
  });

  // Enrollment modal state
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchInstructorCourses();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (selectedCourse) {
      fetchEvaluationData(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchInstructorCourses = async () => {
    try {
      console.log("🔄 fetchInstructorCourses: Starting...", {
        userId: user?.id,
      });
      setLoading(true);

      const { data, error } = await supabase
        .from("courses")
        .select("id, code, name, academic_term_id")
        .eq("instructor_id", user!.id)
        .eq("is_active", true);

      console.log("📚 fetchInstructorCourses: Query result", {
        data,
        error,
        count: data?.length,
      });

      if (error) throw error;

      setCourses(data || []);
      if (data && data.length > 0) {
        console.log(
          "✅ fetchInstructorCourses: Setting selected course",
          data[0].id
        );
        setSelectedCourse(data[0].id);
      } else {
        console.log(
          "⚠️ fetchInstructorCourses: No courses, setting loading=false"
        );
        setLoading(false);
      }
    } catch (error) {
      console.error("❌ fetchInstructorCourses: Error", error);
      setLoading(false);
    }
  };

  const fetchEvaluationData = async (courseId: string) => {
    try {
      console.log("📊 fetchEvaluationData: Starting...", { courseId });

      // Fetch evaluations for the course
      const { data: evaluations, error: evalError } = await supabase
        .from("evaluations")
        .select(
          `
          id,
          status,
          course_id
        `
        )
        .eq("course_id", courseId)
        .eq("status", "submitted");

      if (evalError) throw evalError;

      const totalEvaluations = evaluations?.length || 0;

      if (totalEvaluations === 0) {
        setEvaluationData({
          totalEvaluations: 0,
          overallRating: 0,
          responseRate: 0,
          categoryAverages: {
            teaching: 0,
            materials: 0,
            communication: 0,
          },
          comments: [],
          detailedRatings: {
            teaching_clarity: [],
            teaching_engagement: [],
            teaching_knowledge: [],
            teaching_organization: [],
            teaching_feedback: [],
            materials_quality: [],
            materials_relevance: [],
            materials_accessibility: [],
            materials_variety: [],
            materials_timeliness: [],
            communication_availability: [],
            communication_responsiveness: [],
            communication_clarity: [],
            communication_helpfulness: [],
            communication_approachability: [],
          },
        });
        setLoading(false);
        return;
      }

      const evaluationIds = evaluations.map((e) => e.id);

      // Fetch ratings
      const { data: ratings, error: ratingsError } = await supabase
        .from("evaluation_ratings")
        .select("*")
        .in("evaluation_id", evaluationIds);

      if (ratingsError) throw ratingsError;

      // Fetch comments
      const { data: comments, error: commentsError } = await supabase
        .from("evaluation_comments")
        .select("*")
        .in("evaluation_id", evaluationIds);

      if (commentsError) throw commentsError;

      // Calculate averages
      const detailedRatings: any = {
        teaching_clarity: [],
        teaching_engagement: [],
        teaching_knowledge: [],
        teaching_organization: [],
        teaching_feedback: [],
        materials_quality: [],
        materials_relevance: [],
        materials_accessibility: [],
        materials_variety: [],
        materials_timeliness: [],
        communication_availability: [],
        communication_responsiveness: [],
        communication_clarity: [],
        communication_helpfulness: [],
        communication_approachability: [],
      };

      ratings?.forEach((rating) => {
        Object.keys(detailedRatings).forEach((key) => {
          if (rating[key] && rating[key] > 0) {
            detailedRatings[key].push(rating[key]);
          }
        });
      });

      // Calculate category averages
      const teachingAvg = [
        ...detailedRatings.teaching_clarity,
        ...detailedRatings.teaching_engagement,
        ...detailedRatings.teaching_knowledge,
        ...detailedRatings.teaching_organization,
        ...detailedRatings.teaching_feedback,
      ];
      const materialsAvg = [
        ...detailedRatings.materials_quality,
        ...detailedRatings.materials_relevance,
        ...detailedRatings.materials_accessibility,
        ...detailedRatings.materials_variety,
        ...detailedRatings.materials_timeliness,
      ];
      const communicationAvg = [
        ...detailedRatings.communication_availability,
        ...detailedRatings.communication_responsiveness,
        ...detailedRatings.communication_clarity,
        ...detailedRatings.communication_helpfulness,
        ...detailedRatings.communication_approachability,
      ];

      const calcAvg = (arr: number[]) =>
        arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

      const categoryAverages = {
        teaching: calcAvg(teachingAvg),
        materials: calcAvg(materialsAvg),
        communication: calcAvg(communicationAvg),
      };

      const overallRating =
        (categoryAverages.teaching +
          categoryAverages.materials +
          categoryAverages.communication) /
        3;

      // Get total enrolled students for response rate
      const { data: enrollments, error: enrollError } = await supabase
        .from("enrollments")
        .select("id", { count: "exact" })
        .eq("course_id", courseId);

      if (enrollError) throw enrollError;

      const totalStudents = enrollments?.length || 1;
      const responseRate = (totalEvaluations / totalStudents) * 100;

      setEvaluationData({
        totalEvaluations,
        overallRating,
        responseRate,
        categoryAverages,
        comments: comments || [],
        detailedRatings,
      });
    } catch (error) {
      console.error("Error fetching evaluation data:", error);
    } finally {
      console.log("🏁 fetchEvaluationData: Complete, setting loading=false");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const loadProfile = async () => {
    if (!user?.id) return;

    setProfileLoading(true);
    try {
      // Fetch profile and instructor details
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, first_name, last_name, email, avatar_url, instructor_details(*)"
        )
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        const details = Array.isArray(data.instructor_details)
          ? data.instructor_details[0]
          : data.instructor_details;

        setProfileData({
          profile: {
            id: data.id,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            avatar_url: data.avatar_url,
          },
          details: details
            ? {
                department: details.department,
                office_location: details.office_location,
                specialization: details.specialization,
                academic_rank: details.academic_rank,
              }
            : null,
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user?.id || !profileData.profile) return;

    setProfileLoading(true);
    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: profileData.profile.first_name,
          last_name: profileData.profile.last_name,
          email: profileData.profile.email,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update instructor_details table
      if (profileData.details) {
        // Process specialization: split comma-separated string into array
        const specializationArray = profileData.details.specialization
          ? Array.isArray(profileData.details.specialization) &&
            profileData.details.specialization.length === 1
            ? profileData.details.specialization[0]
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s)
            : profileData.details.specialization
          : [];

        const { error: detailsError } = await supabase
          .from("instructor_details")
          .update({
            department: profileData.details.department,
            office_location: profileData.details.office_location,
            specialization: specializationArray,
            academic_rank: profileData.details.academic_rank,
          })
          .eq("id", user.id);

        if (detailsError) throw detailsError;

        // Update local state with processed array
        setProfileData({
          ...profileData,
          details: {
            ...profileData.details,
            specialization: specializationArray,
          },
        });
      }

      setIsEditingProfile(false);

      // Success feedback
      const successDiv = document.createElement("div");
      successDiv.className =
        "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[100] animate-in fade-in slide-in-from-top-2";
      successDiv.innerHTML = "✓ Profile updated successfully!";
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);

      // Error feedback
      const errorDiv = document.createElement("div");
      errorDiv.className =
        "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[100] animate-in fade-in slide-in-from-top-2";
      errorDiv.innerHTML = "✗ Failed to update profile. Please try again.";
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 3000);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileChange = (field: string, value: string) => {
    if (field in (profileData.profile || {})) {
      setProfileData({
        ...profileData,
        profile: {
          ...profileData.profile!,
          [field]: value,
        },
      });
    } else if (field in (profileData.details || {})) {
      setProfileData({
        ...profileData,
        details: {
          ...profileData.details!,
          [field]: value,
        },
      });
    }
  };

  const handleSpecializationChange = (value: string) => {
    // Store the raw value, split only when saving
    setProfileData({
      ...profileData,
      details: {
        ...profileData.details!,
        specialization: [value], // Store as single-item array to preserve the raw input
      },
    });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  // Enrollment Management Functions
  const loadEnrollments = async () => {
    if (!selectedCourse) return;

    setEnrollmentLoading(true);
    try {
      const { data, error } = await supabase
        .from("enrollments")
        .select(
          `
          id,
          student_id,
          enrollment_date,
          status,
          student:profiles!enrollments_student_id_fkey (
            id,
            first_name,
            last_name,
            email,
            student_details!student_details_id_fkey (
              student_number,
              program,
              year_level
            )
          )
        `
        )
        .eq("course_id", selectedCourse)
        .order("enrollment_date", { ascending: false });

      if (error) throw error;

      console.log("📚 Enrollments Query Result:", {
        data,
        error,
        count: data?.length,
      });

      if (data && data.length > 0) {
        console.log("📚 First Enrollment Sample:", data[0]);
        console.log("📚 Student in First Enrollment:", data[0]?.student);
        console.log(
          "📚 Student Details in First Enrollment:",
          data[0]?.student?.[0]?.student_details
        );
      }

      // Transform data to match Enrollment interface
      const transformedData =
        data?.map((enrollment: any) => {
          // Handle both array and object responses from Supabase
          const details = enrollment.student.student_details;
          const studentDetails = Array.isArray(details) ? details[0] : details;

          return {
            id: enrollment.id,
            student_id: enrollment.student_id,
            enrollment_date: enrollment.enrollment_date,
            status: enrollment.status,
            student: {
              id: enrollment.student.id,
              first_name: enrollment.student.first_name,
              last_name: enrollment.student.last_name,
              email: enrollment.student.email,
              student_details: studentDetails || null,
            },
          };
        }) || [];

      console.log("✅ Transformed Enrollments:", transformedData);
      if (transformedData.length > 0) {
        console.log("✅ First Transformed Enrollment:", transformedData[0]);
      }

      setEnrollments(transformedData);
    } catch (error) {
      console.error("Error loading enrollments:", error);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const loadAvailableStudents = async () => {
    if (!selectedCourse) return;

    try {
      // Get all students
      const { data: allStudents, error: studentsError } = await supabase
        .from("profiles")
        .select(
          `
          id,
          first_name,
          last_name,
          email,
          student_details!student_details_id_fkey (
            student_number,
            program,
            year_level
          )
        `
        )
        .eq("role", "student")
        .eq("status", "approved")
        .eq("is_active", true);

      console.log("🔍 Available Students Query Result:", {
        data: allStudents,
        error: studentsError,
        count: allStudents?.length,
      });

      if (allStudents && allStudents.length > 0) {
        console.log("📋 First Student Sample:", allStudents[0]);
        console.log(
          "📋 Student Details of First Student:",
          allStudents[0]?.student_details
        );
      }

      if (studentsError) throw studentsError;

      // Get already enrolled student IDs
      const { data: enrolled, error: enrolledError } = await supabase
        .from("enrollments")
        .select("student_id")
        .eq("course_id", selectedCourse);

      if (enrolledError) throw enrolledError;

      const enrolledIds = enrolled?.map((e) => e.student_id) || [];

      // Filter out already enrolled students
      const available =
        allStudents
          ?.filter((student: any) => !enrolledIds.includes(student.id))
          .map((student: any) => {
            // Handle both array and object responses from Supabase
            const details = student.student_details;
            const studentDetails = Array.isArray(details)
              ? details[0]
              : details;

            return {
              id: student.id,
              first_name: student.first_name,
              last_name: student.last_name,
              email: student.email,
              student_details: studentDetails || null,
            };
          }) || [];

      console.log("✅ Transformed Available Students:", available);
      if (available.length > 0) {
        console.log("✅ First Available Student:", available[0]);
      }

      setAvailableStudents(available);
    } catch (error) {
      console.error("Error loading available students:", error);
    }
  };

  const handleEnrollStudent = async () => {
    if (!selectedStudentId || !selectedCourse) return;

    setEnrollmentLoading(true);
    try {
      // Get the course's academic term
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("academic_term_id")
        .eq("id", selectedCourse)
        .single();

      if (courseError) throw courseError;

      // Create enrollment
      const { error: enrollError } = await supabase.from("enrollments").insert({
        student_id: selectedStudentId,
        course_id: selectedCourse,
        academic_term_id: course.academic_term_id,
        status: "enrolled",
      });

      if (enrollError) throw enrollError;

      // Success feedback
      const successDiv = document.createElement("div");
      successDiv.className =
        "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[100] animate-in fade-in slide-in-from-top-2";
      successDiv.innerHTML = "✓ Student enrolled successfully!";
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);

      // Reload data
      setSelectedStudentId("");
      await loadEnrollments();
      await loadAvailableStudents();
    } catch (error) {
      console.error("Error enrolling student:", error);

      const errorDiv = document.createElement("div");
      errorDiv.className =
        "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[100] animate-in fade-in slide-in-from-top-2";
      errorDiv.innerHTML = "✗ Failed to enroll student. Please try again.";
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 3000);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleRemoveEnrollment = async (
    enrollmentId: string,
    studentName: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to remove ${studentName} from this course?`
      )
    ) {
      return;
    }

    setEnrollmentLoading(true);
    try {
      const { error } = await supabase
        .from("enrollments")
        .delete()
        .eq("id", enrollmentId);

      if (error) throw error;

      // Success feedback
      const successDiv = document.createElement("div");
      successDiv.className =
        "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[100] animate-in fade-in slide-in-from-top-2";
      successDiv.innerHTML = "✓ Student removed successfully!";
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);

      // Reload data
      await loadEnrollments();
      await loadAvailableStudents();
    } catch (error) {
      console.error("Error removing enrollment:", error);

      const errorDiv = document.createElement("div");
      errorDiv.className =
        "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[100] animate-in fade-in slide-in-from-top-2";
      errorDiv.innerHTML = "✗ Failed to remove student. Please try again.";
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 3000);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      enrollment.student.first_name.toLowerCase().includes(searchLower) ||
      enrollment.student.last_name.toLowerCase().includes(searchLower) ||
      enrollment.student.email.toLowerCase().includes(searchLower) ||
      enrollment.student.student_details?.student_number
        .toLowerCase()
        .includes(searchLower) ||
      enrollment.student.student_details?.program
        .toLowerCase()
        .includes(searchLower)
    );
  });

  // AI Analysis Function
  const handleGenerateAIAnalysis = async () => {
    if (!evaluationData || evaluationData.totalEvaluations === 0) {
      setAiError("No evaluation data available to analyze.");
      return;
    }

    if (!selectedCourse || !user?.id) {
      setAiError("Course or user information is missing.");
      return;
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const analysis = await generateAIAnalysis(evaluationData);
      setAiAnalysis(analysis);

      // Save the report to the database
      const savedReport = await saveAIReport(
        selectedCourse,
        user.id,
        evaluationData,
        analysis
      );

      if (savedReport) {
        console.log("✅ AI report saved successfully", savedReport);
      } else {
        console.warn("⚠️ AI report generated but not saved to database");
      }
    } catch (error) {
      console.error("Error generating AI analysis:", error);
      setAiError(
        error instanceof Error
          ? error.message
          : "Failed to generate AI analysis. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9F5F0] to-[#F2EAD3]/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#344F1F] mx-auto mb-4"></div>
          <p className="text-[#344F1F]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9F5F0] to-[#F2EAD3]/30">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#344F1F]/10 shadow-sm">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-[#344F1F]">
                Welcome, {user?.firstName} {user?.lastName}
              </h1>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-[#344F1F]/20 hover:bg-[#344F1F] hover:text-[#F2EAD3]"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-xl text-[#344F1F]">
            You don't have any active courses yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F5F0] to-[#F2EAD3]/30">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#344F1F]/10 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Instructor Profile */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-[#344F1F] ring-offset-2">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-gradient-to-br from-[#344F1F] to-[#344F1F]/80 text-[#F2EAD3] font-bold">
                  {getInitials(user?.firstName, user?.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-bold text-[#344F1F]">
                  Welcome, {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-sm text-black/60">Instructor Dashboard</p>
              </div>
            </div>

            {/* Right: Course Selection, Profile & Logout */}
            <div className="flex items-center gap-3">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="hidden sm:block px-4 py-2 border border-[#344F1F]/20 rounded-lg text-sm bg-white hover:border-[#344F1F]/40 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F4991A]"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>

              {/* Profile Modal */}
              <Dialog
                open={showProfileModal}
                onOpenChange={(open: boolean) => {
                  setShowProfileModal(open);
                  if (open) {
                    loadProfile();
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#344F1F]/20 hover:bg-[#344F1F] hover:text-[#F2EAD3] transition-all"
                  >
                    <UserCircle className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#344F1F] flex items-center justify-between pb-4 border-b border-[#344F1F]/20">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#344F1F] to-[#5a7f3a] flex items-center justify-center">
                          <UserCircle className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-[#344F1F]">
                            Instructor Profile
                          </h2>
                          <p className="text-sm text-gray-500 font-normal">
                            Manage your account information
                          </p>
                        </div>
                      </div>
                      {!isEditingProfile ? (
                        <Button
                          onClick={() => setIsEditingProfile(true)}
                          size="sm"
                          className="bg-[#F4991A] hover:bg-[#e08915] text-white shadow-md hover:shadow-lg transition-all"
                        >
                          <UserCircle className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            onClick={updateProfile}
                            disabled={profileLoading}
                            size="sm"
                            className="bg-[#344F1F] hover:bg-[#2a3f19] text-white shadow-md hover:shadow-lg transition-all"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            onClick={() => setIsEditingProfile(false)}
                            disabled={profileLoading}
                            size="sm"
                            variant="outline"
                            className="border-red-400 text-red-600 hover:bg-red-50 hover:border-red-500 transition-all"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </DialogTitle>
                  </DialogHeader>

                  {profileLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#344F1F]/20 border-t-[#344F1F] mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading profile...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 py-4">
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-8 w-1 bg-gradient-to-b from-[#344F1F] to-[#5a7f3a] rounded-full"></div>
                          <h3 className="text-lg font-bold text-[#344F1F]">
                            Personal Information
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="first_name"
                              className="text-sm font-semibold text-gray-700"
                            >
                              First Name
                            </Label>
                            {isEditingProfile ? (
                              <Input
                                id="first_name"
                                value={profileData.profile?.first_name || ""}
                                onChange={(e) =>
                                  handleProfileChange(
                                    "first_name",
                                    e.target.value
                                  )
                                }
                                className="border-2 border-gray-200 focus:border-[#F4991A] focus:ring-2 focus:ring-[#F4991A]/20 rounded-lg transition-all"
                              />
                            ) : (
                              <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-200">
                                <p className="text-gray-800 font-medium">
                                  {profileData.profile?.first_name || "N/A"}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="last_name"
                              className="text-sm font-semibold text-gray-700"
                            >
                              Last Name
                            </Label>
                            {isEditingProfile ? (
                              <Input
                                id="last_name"
                                value={profileData.profile?.last_name || ""}
                                onChange={(e) =>
                                  handleProfileChange(
                                    "last_name",
                                    e.target.value
                                  )
                                }
                                className="border-2 border-gray-200 focus:border-[#F4991A] focus:ring-2 focus:ring-[#F4991A]/20 rounded-lg transition-all"
                              />
                            ) : (
                              <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-200">
                                <p className="text-gray-800 font-medium">
                                  {profileData.profile?.last_name || "N/A"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="text-sm font-semibold text-gray-700"
                          >
                            Email Address
                          </Label>
                          {isEditingProfile ? (
                            <Input
                              id="email"
                              type="email"
                              value={profileData.profile?.email || ""}
                              onChange={(e) =>
                                handleProfileChange("email", e.target.value)
                              }
                              className="border-2 border-gray-200 focus:border-[#F4991A] focus:ring-2 focus:ring-[#F4991A]/20 rounded-lg transition-all"
                            />
                          ) : (
                            <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-200">
                              <p className="text-gray-800 font-medium">
                                {profileData.profile?.email || "N/A"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Instructor Details */}
                      <div className="space-y-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-8 w-1 bg-gradient-to-b from-[#F4991A] to-[#e08915] rounded-full"></div>
                          <h3 className="text-lg font-bold text-[#344F1F]">
                            Instructor Details
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="department"
                              className="text-sm font-semibold text-gray-700"
                            >
                              Department
                            </Label>
                            {isEditingProfile ? (
                              <Input
                                id="department"
                                value={profileData.details?.department || ""}
                                onChange={(e) =>
                                  handleProfileChange(
                                    "department",
                                    e.target.value
                                  )
                                }
                                className="border-2 border-gray-200 focus:border-[#F4991A] focus:ring-2 focus:ring-[#F4991A]/20 rounded-lg transition-all"
                              />
                            ) : (
                              <div className="p-3 bg-gradient-to-r from-[#344F1F]/5 to-[#344F1F]/10 rounded-lg border border-[#344F1F]/20">
                                <p className="text-gray-800 font-medium">
                                  {profileData.details?.department || "N/A"}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="office_location"
                              className="text-sm font-semibold text-gray-700"
                            >
                              Office Location
                            </Label>
                            {isEditingProfile ? (
                              <Input
                                id="office_location"
                                value={
                                  profileData.details?.office_location || ""
                                }
                                onChange={(e) =>
                                  handleProfileChange(
                                    "office_location",
                                    e.target.value
                                  )
                                }
                                className="border-2 border-gray-200 focus:border-[#F4991A] focus:ring-2 focus:ring-[#F4991A]/20 rounded-lg transition-all"
                                placeholder="e.g., Room 304, Building A"
                              />
                            ) : (
                              <div className="p-3 bg-gradient-to-r from-[#344F1F]/5 to-[#344F1F]/10 rounded-lg border border-[#344F1F]/20">
                                <p className="text-gray-800 font-medium">
                                  {profileData.details?.office_location ||
                                    "N/A"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="academic_rank"
                            className="text-sm font-semibold text-gray-700"
                          >
                            Academic Rank
                          </Label>
                          {isEditingProfile ? (
                            <Input
                              id="academic_rank"
                              value={profileData.details?.academic_rank || ""}
                              onChange={(e) =>
                                handleProfileChange(
                                  "academic_rank",
                                  e.target.value
                                )
                              }
                              className="border-2 border-gray-200 focus:border-[#F4991A] focus:ring-2 focus:ring-[#F4991A]/20 rounded-lg transition-all"
                              placeholder="e.g., Assistant Professor, Associate Professor"
                            />
                          ) : (
                            <div className="p-3 bg-gradient-to-r from-[#344F1F]/5 to-[#344F1F]/10 rounded-lg border border-[#344F1F]/20">
                              <p className="text-gray-800 font-medium">
                                {profileData.details?.academic_rank || "N/A"}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="specialization"
                            className="text-sm font-semibold text-gray-700"
                          >
                            Specialization
                          </Label>
                          {isEditingProfile ? (
                            <div className="space-y-2">
                              <Textarea
                                id="specialization"
                                value={
                                  Array.isArray(
                                    profileData.details?.specialization
                                  ) &&
                                  profileData.details.specialization.length ===
                                    1
                                    ? profileData.details.specialization[0]
                                    : profileData.details?.specialization?.join(
                                        ", "
                                      ) || ""
                                }
                                onChange={(e) =>
                                  handleSpecializationChange(e.target.value)
                                }
                                className="border-2 border-gray-200 focus:border-[#F4991A] focus:ring-2 focus:ring-[#F4991A]/20 rounded-lg transition-all resize-none"
                                placeholder="Enter specializations separated by commas"
                                rows={3}
                              />
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <span className="inline-block w-1.5 h-1.5 bg-[#F4991A] rounded-full"></span>
                                Separate multiple specializations with commas
                              </p>
                            </div>
                          ) : (
                            <div className="p-3 bg-gradient-to-r from-[#344F1F]/5 to-[#344F1F]/10 rounded-lg border border-[#344F1F]/20">
                              <div className="flex flex-wrap gap-2">
                                {profileData.details?.specialization &&
                                profileData.details.specialization.length >
                                  0 ? (
                                  profileData.details.specialization.map(
                                    (spec, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#344F1F] text-white"
                                      >
                                        {spec}
                                      </span>
                                    )
                                  )
                                ) : (
                                  <p className="text-gray-800 font-medium">
                                    N/A
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-[#344F1F]/20 hover:bg-[#344F1F] hover:text-[#F2EAD3] transition-all"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#344F1F] mb-2">
              Course Evaluation Dashboard
            </h2>
            <p className="text-black/60">
              Track your teaching performance and student feedback
            </p>
          </div>

          {/* Manage Students Button */}
          <Dialog
            open={showEnrollmentModal}
            onOpenChange={(open: boolean) => {
              setShowEnrollmentModal(open);
              if (open && selectedCourse) {
                loadEnrollments();
                loadAvailableStudents();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                className="bg-[#F4991A] hover:bg-[#e08915] text-white shadow-md hover:shadow-lg transition-all"
                disabled={!selectedCourse}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Manage Students
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#344F1F] flex items-center gap-3 pb-4 border-b border-[#344F1F]/20">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#F4991A] to-[#e08915] flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#344F1F]">
                      Manage Student Enrollment
                    </h2>
                    <p className="text-sm text-gray-500 font-normal">
                      {courses.find((c) => c.id === selectedCourse)?.code} -{" "}
                      {courses.find((c) => c.id === selectedCourse)?.name}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              {enrollmentLoading && enrollments.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#344F1F]/20 border-t-[#344F1F] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading students...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 py-4">
                  {/* Add Student Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-1 bg-gradient-to-b from-[#F4991A] to-[#e08915] rounded-full"></div>
                      <h3 className="text-lg font-bold text-[#344F1F]">
                        Enroll New Student
                      </h3>
                    </div>

                    <div className="flex gap-3">
                      <select
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#F4991A] focus:ring-2 focus:ring-[#F4991A]/20 transition-all"
                        disabled={enrollmentLoading}
                      >
                        <option value="">Select a student to enroll...</option>
                        {availableStudents.map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.first_name} {student.last_name} -{" "}
                            {student.student_details?.student_number || "No ID"}{" "}
                            | {student.student_details?.program || "No Program"}{" "}
                            | Year {student.student_details?.year_level || "?"}
                          </option>
                        ))}
                      </select>
                      <Button
                        onClick={handleEnrollStudent}
                        disabled={!selectedStudentId || enrollmentLoading}
                        className="bg-[#344F1F] hover:bg-[#2a3f19] text-white shadow-md hover:shadow-lg transition-all"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Enroll
                      </Button>
                    </div>

                    {availableStudents.length === 0 && (
                      <p className="text-sm text-gray-500 italic">
                        All students are already enrolled in this course.
                      </p>
                    )}
                  </div>

                  {/* Enrolled Students List */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-1 bg-gradient-to-b from-[#344F1F] to-[#5a7f3a] rounded-full"></div>
                        <h3 className="text-lg font-bold text-[#344F1F]">
                          Enrolled Students ({enrollments.length})
                        </h3>
                      </div>

                      {/* Search Box */}
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Search students..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 border-2 border-gray-200 focus:border-[#F4991A] focus:ring-2 focus:ring-[#F4991A]/20"
                        />
                      </div>
                    </div>

                    {filteredEnrollments.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                          {searchQuery
                            ? "No students match your search."
                            : "No students enrolled yet."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredEnrollments.map((enrollment) => (
                          <div
                            key={enrollment.id}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200 hover:border-[#344F1F]/30 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#344F1F] to-[#5a7f3a] flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {enrollment.student.first_name[0]}
                                  {enrollment.student.last_name[0]}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {enrollment.student.first_name}{" "}
                                  {enrollment.student.last_name}
                                </p>
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                  <span>
                                    {enrollment.student.student_details
                                      ?.student_number || "N/A"}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {enrollment.student.student_details
                                      ?.program || "N/A"}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    Year{" "}
                                    {enrollment.student.student_details
                                      ?.year_level || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  enrollment.status === "enrolled"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {enrollment.status}
                              </span>
                              <Button
                                onClick={() =>
                                  handleRemoveEnrollment(
                                    enrollment.id,
                                    `${enrollment.student.first_name} ${enrollment.student.last_name}`
                                  )
                                }
                                disabled={enrollmentLoading}
                                variant="outline"
                                size="sm"
                                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#344F1F] mx-auto mb-4"></div>
            <p className="text-[#344F1F]">Loading evaluation data...</p>
          </div>
        ) : (
          <>
            {console.log(
              "✨ Rendering dashboard content, loading=",
              loading,
              "activeTab=",
              activeTab
            )}
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Evaluations Card */}
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-black/60 mb-1">
                        Total Evaluations
                      </p>
                      <p className="text-3xl font-bold text-[#344F1F]">
                        {evaluationData?.totalEvaluations || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-[#344F1F]/10 rounded-full">
                      <Users className="h-6 w-6 text-[#344F1F]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Overall Rating Card */}
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-[#F4991A]/5 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-black/60 mb-1">
                        Overall Rating
                      </p>
                      <div className="flex items-baseline gap-3">
                        <p className="text-4xl font-extrabold text-[#F4991A]">
                          {evaluationData?.overallRating.toFixed(1) || "0.0"}
                        </p>
                        <p className="text-sm font-semibold text-black">/5.0</p>
                      </div>
                      <div className="flex gap-1 mt-3 items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <=
                              Math.round(evaluationData?.overallRating || 0)
                                ? "fill-[#F4991A] text-[#F4991A]"
                                : "text-black/20"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="p-3 bg-[#F4991A]/10 rounded-full">
                      <Star className="h-6 w-6 text-[#F4991A]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Rate Card */}
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="w-full">
                      <p className="text-sm font-medium text-black/60 mb-1">
                        Response Rate
                      </p>
                      <p className="text-3xl font-extrabold text-[#344F1F]">
                        {evaluationData?.responseRate.toFixed(0) || 0}%
                      </p>
                      <div className="mt-3">
                        <Progress
                          value={evaluationData?.responseRate || 0}
                          className="h-3 rounded-full"
                        />
                      </div>
                    </div>
                    <div className="p-3 bg-[#344F1F]/10 rounded-full">
                      <TrendingUp className="h-6 w-6 text-[#344F1F]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs Navigation */}
            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                console.log("🔀 Tab change triggered:", value);
                setActiveTab(value);
              }}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2 bg-white p-2 rounded-xl shadow-md border border-[#344F1F]/10">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-[#344F1F] data-[state=active]:text-[#F2EAD3] flex items-center gap-2 rounded-lg transition-all"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger
                  value="detailed"
                  className="data-[state=active]:bg-[#344F1F] data-[state=active]:text-[#F2EAD3] flex items-center gap-2 rounded-lg transition-all"
                >
                  <Award className="h-4 w-4" />
                  <span className="hidden sm:inline">Detailed Ratings</span>
                </TabsTrigger>
                <TabsTrigger
                  value="comments"
                  className="data-[state=active]:bg-[#344F1F] data-[state=active]:text-[#F2EAD3] flex items-center gap-2 rounded-lg transition-all"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Student Comments</span>
                </TabsTrigger>
                <TabsTrigger
                  value="ai"
                  className="data-[state=active]:bg-[#344F1F] data-[state=active]:text-[#F2EAD3] flex items-center gap-2 rounded-lg transition-all"
                >
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline">AI Analysis</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card className="border-none shadow-lg bg-white">
                  <CardHeader>
                    <CardTitle className="text-[#344F1F]">
                      Category Performance
                    </CardTitle>
                    <CardDescription>
                      Average ratings across evaluation categories
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Teaching Category */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#344F1F]">
                          Teaching Effectiveness
                        </span>
                        <span className="text-sm font-bold text-[#F4991A]">
                          {evaluationData?.categoryAverages.teaching.toFixed(
                            1
                          ) || "0.0"}
                          <span className="text-sm font-semibold text-black">
                            /5.0
                          </span>
                        </span>
                      </div>
                      <Progress
                        value={
                          (evaluationData?.categoryAverages.teaching || 0) * 20
                        }
                        className="h-3"
                      />
                    </div>

                    {/* Materials Category */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#344F1F]">
                          Learning Materials
                        </span>
                        <span className="text-sm font-bold text-[#F4991A]">
                          {evaluationData?.categoryAverages.materials.toFixed(
                            1
                          ) || "0.0"}
                          <span className="text-sm font-semibold text-black">
                            /5.0
                          </span>
                        </span>
                      </div>
                      <Progress
                        value={
                          (evaluationData?.categoryAverages.materials || 0) * 20
                        }
                        className="h-3"
                      />
                    </div>

                    {/* Communication Category */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#344F1F]">
                          Communication & Accessibility
                        </span>
                        <span className="text-sm font-bold text-[#F4991A]">
                          {evaluationData?.categoryAverages.communication.toFixed(
                            1
                          ) || "0.0"}
                          <span className="text-sm font-semibold text-black">
                            /5.0
                          </span>
                        </span>
                      </div>
                      <Progress
                        value={
                          (evaluationData?.categoryAverages.communication ||
                            0) * 20
                        }
                        className="h-3"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Detailed Ratings Tab */}
              <TabsContent value="detailed" className="space-y-6">
                <Card className="border-none shadow-lg bg-white">
                  <CardHeader>
                    <CardTitle className="text-[#344F1F]">
                      Detailed Question Ratings
                    </CardTitle>
                    <CardDescription>
                      Individual question performance breakdown
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Teaching Questions */}
                    <div>
                      <h3 className="font-semibold text-[#344F1F] mb-3">
                        Teaching Effectiveness
                      </h3>
                      <div className="space-y-3">
                        {[
                          {
                            key: "teaching_clarity",
                            label: "Clarity of explanation",
                          },
                          {
                            key: "teaching_engagement",
                            label: "Student engagement",
                          },
                          {
                            key: "teaching_knowledge",
                            label: "Subject knowledge",
                          },
                          {
                            key: "teaching_organization",
                            label: "Course organization",
                          },
                          {
                            key: "teaching_feedback",
                            label: "Feedback quality",
                          },
                        ].map((item) => {
                          const ratings =
                            evaluationData?.detailedRatings[
                              item.key as keyof typeof evaluationData.detailedRatings
                            ] || [];
                          const avg =
                            ratings.length > 0
                              ? ratings.reduce(
                                  (a: number, b: number) => a + b,
                                  0
                                ) / ratings.length
                              : 0;
                          return (
                            <div key={item.key} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-black/80">
                                  {item.label}
                                </span>
                                <span className="inline-flex items-center gap-2">
                                  <span className="text-lg font-extrabold text-[#F4991A]">
                                    {avg.toFixed(1)}
                                  </span>
                                  <span className="text-sm font-semibold text-black">
                                    /5
                                  </span>
                                </span>
                              </div>
                              <Progress
                                value={avg * 20}
                                className="h-3 rounded-full"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Materials Questions */}
                    <div>
                      <h3 className="font-semibold text-[#344F1F] mb-3">
                        Learning Materials
                      </h3>
                      <div className="space-y-3">
                        {[
                          {
                            key: "materials_quality",
                            label: "Quality of materials",
                          },
                          {
                            key: "materials_relevance",
                            label: "Relevance to course",
                          },
                          {
                            key: "materials_accessibility",
                            label: "Accessibility",
                          },
                          {
                            key: "materials_variety",
                            label: "Variety of resources",
                          },
                          { key: "materials_timeliness", label: "Timeliness" },
                        ].map((item) => {
                          const ratings =
                            evaluationData?.detailedRatings[
                              item.key as keyof typeof evaluationData.detailedRatings
                            ] || [];
                          const avg =
                            ratings.length > 0
                              ? ratings.reduce(
                                  (a: number, b: number) => a + b,
                                  0
                                ) / ratings.length
                              : 0;
                          return (
                            <div key={item.key} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-black/80">
                                  {item.label}
                                </span>
                                <span className="inline-flex items-center gap-2">
                                  <span className="text-lg font-extrabold text-[#F4991A]">
                                    {avg.toFixed(1)}
                                  </span>
                                  <span className="text-sm font-semibold text-black">
                                    /5
                                  </span>
                                </span>
                              </div>
                              <Progress
                                value={avg * 20}
                                className="h-3 rounded-full"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Communication Questions */}
                    <div>
                      <h3 className="font-semibold text-[#344F1F] mb-3">
                        Communication & Accessibility
                      </h3>
                      <div className="space-y-3">
                        {[
                          {
                            key: "communication_availability",
                            label: "Availability",
                          },
                          {
                            key: "communication_responsiveness",
                            label: "Responsiveness",
                          },
                          {
                            key: "communication_clarity",
                            label: "Communication clarity",
                          },
                          {
                            key: "communication_helpfulness",
                            label: "Helpfulness",
                          },
                          {
                            key: "communication_approachability",
                            label: "Approachability",
                          },
                        ].map((item) => {
                          const ratings =
                            evaluationData?.detailedRatings[
                              item.key as keyof typeof evaluationData.detailedRatings
                            ] || [];
                          const avg =
                            ratings.length > 0
                              ? ratings.reduce(
                                  (a: number, b: number) => a + b,
                                  0
                                ) / ratings.length
                              : 0;
                          return (
                            <div key={item.key} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-black/80">
                                  {item.label}
                                </span>
                                <span className="inline-flex items-center gap-2">
                                  <span className="text-lg font-extrabold text-[#F4991A]">
                                    {avg.toFixed(1)}
                                  </span>
                                  <span className="text-sm font-semibold text-black">
                                    /5
                                  </span>
                                </span>
                              </div>
                              <Progress
                                value={avg * 20}
                                className="h-3 rounded-full"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Student Comments Tab */}
              <TabsContent value="comments" className="space-y-6">
                <Card className="border-none shadow-lg bg-white">
                  <CardHeader>
                    <CardTitle className="text-[#344F1F] text-center font-bold text-2xl">
                      Student Feedback
                    </CardTitle>
                    <CardDescription>
                      Comments from student evaluations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {evaluationData?.comments &&
                    evaluationData.comments.length > 0 ? (
                      evaluationData.comments.map((comment, index) => (
                        <div
                          key={index}
                          className="p-4 bg-white rounded-lg border-2 border-[#344F1F]/20 shadow-sm divide-y divide-[#344F1F]/10"
                        >
                          {comment.teaching_comments && (
                            <BilingualComment
                              title="Teaching"
                              translatedText={comment.teaching_comments}
                              originalText={comment.teaching_comments_original}
                              languageCode={comment.teaching_comments_language}
                            />
                          )}
                          {comment.materials_comments && (
                            <BilingualComment
                              title="Materials"
                              translatedText={comment.materials_comments}
                              originalText={comment.materials_comments_original}
                              languageCode={comment.materials_comments_language}
                            />
                          )}
                          {comment.communication_comments && (
                            <BilingualComment
                              title="Communication"
                              translatedText={comment.communication_comments}
                              originalText={comment.communication_comments_original}
                              languageCode={comment.communication_comments_language}
                            />
                          )}
                          {comment.general_comments && (
                            <BilingualComment
                              title="General"
                              translatedText={comment.general_comments}
                              originalText={comment.general_comments_original}
                              languageCode={comment.general_comments_language}
                            />
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-black/60 py-8">
                        No comments yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* AI Analysis Tab */}
              <TabsContent value="ai" className="space-y-6">
                <Card className="border-none shadow-lg bg-gradient-to-br from-[#F4991A]/5 via-white to-[#344F1F]/5">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-[#344F1F] flex items-center gap-2 mb-2">
                          <Sparkles className="h-5 w-5 text-[#F4991A]" />
                          AI-Powered Analysis
                        </CardTitle>
                        <CardDescription>
                          Get AI-generated insights from student feedback using
                          OpenAI
                        </CardDescription>
                      </div>
                      {!aiAnalysis && !aiLoading && (
                        <Button
                          onClick={handleGenerateAIAnalysis}
                          disabled={
                            aiLoading ||
                            !evaluationData ||
                            evaluationData.totalEvaluations === 0
                          }
                          className="bg-gradient-to-r from-[#F4991A] to-[#e08915] hover:from-[#e08915] hover:to-[#c77910] text-white shadow-md hover:shadow-lg transition-all"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Analysis
                        </Button>
                      )}
                      {aiAnalysis && (
                        <Button
                          onClick={handleGenerateAIAnalysis}
                          disabled={aiLoading}
                          variant="outline"
                          className="border-[#344F1F]/20 hover:bg-[#344F1F] hover:text-[#F2EAD3]"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Regenerate
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {aiLoading && (
                      <div className="text-center py-12">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#344F1F]/20 border-t-[#F4991A] mx-auto mb-4"></div>
                          <Brain className="h-8 w-8 text-[#344F1F] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <p className="text-[#344F1F] font-medium">
                          Analyzing evaluation data...
                        </p>
                        <p className="text-sm text-black/60 mt-2">
                          This may take a few moments
                        </p>
                      </div>
                    )}

                    {aiError && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                        <p className="text-red-700 font-medium mb-2">
                          Failed to generate analysis
                        </p>
                        <p className="text-sm text-red-600">{aiError}</p>
                        <Button
                          onClick={handleGenerateAIAnalysis}
                          className="mt-4 bg-red-500 hover:bg-red-600 text-white"
                        >
                          Try Again
                        </Button>
                      </div>
                    )}

                    {!aiLoading && !aiError && !aiAnalysis && (
                      <div className="text-center py-12">
                        <Brain className="h-16 w-16 text-[#344F1F]/20 mx-auto mb-4" />
                        <p className="text-[#344F1F] font-medium mb-2">
                          Ready to generate AI insights
                        </p>
                        <p className="text-sm text-black/60 max-w-md mx-auto">
                          Click the "Generate Analysis" button to get AI-powered
                          insights from your student evaluations
                        </p>
                      </div>
                    )}

                    {aiAnalysis && !aiLoading && (
                      <div className="space-y-6">
                        {/* Summary Section */}
                        <div className="bg-gradient-to-br from-[#344F1F]/5 to-white p-6 rounded-lg border-2 border-[#344F1F]/10">
                          <div className="flex items-center gap-2 mb-3">
                            <Brain className="h-5 w-5 text-[#F4991A]" />
                            <h3 className="font-bold text-[#344F1F] text-lg">
                              Executive Summary
                            </h3>
                          </div>
                          <p className="text-black/80 leading-relaxed">
                            {aiAnalysis.summary}
                          </p>
                        </div>

                        {/* Sentiment Analysis */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-[#F4991A]/30 transition-all">
                            <p className="text-sm text-black/60 mb-2">
                              Overall Sentiment
                            </p>
                            <div className="flex items-center gap-2">
                              {aiAnalysis.sentimentAnalysis.overall ===
                                "positive" && (
                                <>
                                  <ThumbsUp className="h-5 w-5 text-green-500" />
                                  <span className="font-bold text-green-600">
                                    Positive
                                  </span>
                                </>
                              )}
                              {aiAnalysis.sentimentAnalysis.overall ===
                                "neutral" && (
                                <>
                                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                                  <span className="font-bold text-yellow-600">
                                    Neutral
                                  </span>
                                </>
                              )}
                              {aiAnalysis.sentimentAnalysis.overall ===
                                "negative" && (
                                <>
                                  <TrendingDown className="h-5 w-5 text-red-500" />
                                  <span className="font-bold text-red-600">
                                    Negative
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                            <p className="text-sm text-black/60 mb-2">
                              Teaching
                            </p>
                            <div className="flex items-center gap-2">
                              {aiAnalysis.sentimentAnalysis.teaching ===
                                "positive" && (
                                <>
                                  <ThumbsUp className="h-5 w-5 text-green-500" />
                                  <span className="font-bold text-green-600">
                                    Positive
                                  </span>
                                </>
                              )}
                              {aiAnalysis.sentimentAnalysis.teaching ===
                                "neutral" && (
                                <>
                                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                                  <span className="font-bold text-yellow-600">
                                    Neutral
                                  </span>
                                </>
                              )}
                              {aiAnalysis.sentimentAnalysis.teaching ===
                                "negative" && (
                                <>
                                  <TrendingDown className="h-5 w-5 text-red-500" />
                                  <span className="font-bold text-red-600">
                                    Negative
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                            <p className="text-sm text-black/60 mb-2">
                              Materials
                            </p>
                            <div className="flex items-center gap-2">
                              {aiAnalysis.sentimentAnalysis.materials ===
                                "positive" && (
                                <>
                                  <ThumbsUp className="h-5 w-5 text-green-500" />
                                  <span className="font-bold text-green-600">
                                    Positive
                                  </span>
                                </>
                              )}
                              {aiAnalysis.sentimentAnalysis.materials ===
                                "neutral" && (
                                <>
                                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                                  <span className="font-bold text-yellow-600">
                                    Neutral
                                  </span>
                                </>
                              )}
                              {aiAnalysis.sentimentAnalysis.materials ===
                                "negative" && (
                                <>
                                  <TrendingDown className="h-5 w-5 text-red-500" />
                                  <span className="font-bold text-red-600">
                                    Negative
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                            <p className="text-sm text-black/60 mb-2">
                              Communication
                            </p>
                            <div className="flex items-center gap-2">
                              {aiAnalysis.sentimentAnalysis.communication ===
                                "positive" && (
                                <>
                                  <ThumbsUp className="h-5 w-5 text-green-500" />
                                  <span className="font-bold text-green-600">
                                    Positive
                                  </span>
                                </>
                              )}
                              {aiAnalysis.sentimentAnalysis.communication ===
                                "neutral" && (
                                <>
                                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                                  <span className="font-bold text-yellow-600">
                                    Neutral
                                  </span>
                                </>
                              )}
                              {aiAnalysis.sentimentAnalysis.communication ===
                                "negative" && (
                                <>
                                  <TrendingDown className="h-5 w-5 text-red-500" />
                                  <span className="font-bold text-red-600">
                                    Negative
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Strengths */}
                        <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                          <div className="flex items-center gap-2 mb-4">
                            <ThumbsUp className="h-5 w-5 text-green-600" />
                            <h3 className="font-bold text-green-800 text-lg">
                              Key Strengths
                            </h3>
                          </div>
                          <ul className="space-y-2">
                            {aiAnalysis.strengths.map((strength, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="text-green-600 mt-1">✓</span>
                                <span className="text-green-900">
                                  {strength}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Areas for Improvement */}
                        <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-200">
                          <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                            <h3 className="font-bold text-orange-800 text-lg">
                              Areas for Improvement
                            </h3>
                          </div>
                          <ul className="space-y-2">
                            {aiAnalysis.areasForImprovement.map(
                              (area, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-orange-600 mt-1">
                                    →
                                  </span>
                                  <span className="text-orange-900">
                                    {area}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>

                        {/* Recommendations */}
                        <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                          <div className="flex items-center gap-2 mb-4">
                            <Lightbulb className="h-5 w-5 text-blue-600" />
                            <h3 className="font-bold text-blue-800 text-lg">
                              Actionable Recommendations
                            </h3>
                          </div>
                          <ul className="space-y-2">
                            {aiAnalysis.recommendations.map(
                              (recommendation, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-blue-600 mt-1">💡</span>
                                  <span className="text-blue-900">
                                    {recommendation}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>

                        {/* Key Themes */}
                        <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
                          <div className="flex items-center gap-2 mb-4">
                            <Brain className="h-5 w-5 text-purple-600" />
                            <h3 className="font-bold text-purple-800 text-lg">
                              Key Themes Identified
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {aiAnalysis.keyThemes.map((theme, index) => (
                              <span
                                key={index}
                                className="px-4 py-2 bg-purple-100 border border-purple-300 rounded-full text-purple-900 text-sm font-medium"
                              >
                                {theme}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                          <p className="text-xs text-gray-600 italic">
                            <AlertCircle className="h-3 w-3 inline mr-1" />
                            AI-generated analysis is provided as guidance.
                            Please review with your own professional judgment.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
