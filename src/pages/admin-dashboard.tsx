"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Shield,
  LogOut,
  CheckCircle,
  XCircle,
  Trash2,
  BookOpen,
  Plus,
  Edit,
  Save,
  X,
  Activity,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/supabase-client";
import { 
  getAllActivityLogs, 
  getActivityLogStats, 
  type ActivityLog 
} from "@/services/activity-logs-service";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "student" | "instructor" | "admin";
  status: "pending" | "approved" | "suspended";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  totalUsers: number;
  pendingRequests: number;
  activeInstructors: number;
  activeStudents: number;
  suspendedUsers: number;
}

interface Course {
  id: string;
  code: string;
  name: string;
  instructor_id: string;
  academic_term_id: string;
  description: string;
  units: number;
  schedule_days: string[];
  schedule_time_start: string;
  schedule_time_end: string;
  room: string;
  max_students: number;
  is_active: boolean;
  created_at: string;
  instructor?: {
    first_name: string;
    last_name: string;
  };
}

interface AcademicTerm {
  id: string;
  academic_year: number;
  semester: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface CourseFormData {
  code: string;
  name: string;
  instructor_id: string;
  academic_term_id: string;
  description: string;
  units: number;
  schedule_days: string[];
  schedule_time_start: string;
  schedule_time_end: string;
  room: string;
  max_students: number;
  is_active: boolean;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    pendingRequests: 0,
    activeInstructors: 0,
    activeStudents: 0,
    suspendedUsers: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Activity logs states
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activityLogStats, setActivityLogStats] = useState({
    totalActivities: 0,
    todayActivities: 0,
    userRegistrations: 0,
    instantSetupRequests: 0,
    userApprovals: 0,
    userSuspensions: 0,
  });
  const [activityFilterType, setActivityFilterType] = useState<string>("all");
  const [activityLogsLoading, setActivityLogsLoading] = useState(false);

  // Course management states
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [academicTerms, setAcademicTerms] = useState<AcademicTerm[]>([]);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseFormData, setCourseFormData] = useState<CourseFormData>({
    code: "",
    name: "",
    instructor_id: "",
    academic_term_id: "",
    description: "",
    units: 3,
    schedule_days: [],
    schedule_time_start: "",
    schedule_time_end: "",
    room: "",
    max_students: 40,
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === "activity-logs") {
      loadActivityLogs();
      loadActivityLogStats();
    }
  }, [activeTab, activityFilterType]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUsers(),
        loadPendingUsers(),
        loadStats(),
        loadCourses(),
        loadInstructors(),
        loadAcademicTerms(),
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .neq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading users:", error);
      return;
    }

    setUsers(data || []);
  };

  const loadPendingUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading pending users:", error);
      return;
    }

    setPendingUsers(data || []);
  };

  const loadStats = async () => {
    const { data: allUsers, error } = await supabase
      .from("profiles")
      .select("role, status, is_active");

    if (error) {
      console.error("Error loading stats:", error);
      return;
    }

    const newStats: UserStats = {
      totalUsers: allUsers?.length || 0,
      pendingRequests:
        allUsers?.filter((u) => u.status === "pending").length || 0,
      activeInstructors:
        allUsers?.filter(
          (u) =>
            u.role === "instructor" && u.is_active && u.status === "approved"
        ).length || 0,
      activeStudents:
        allUsers?.filter(
          (u) => u.role === "student" && u.is_active && u.status === "approved"
        ).length || 0,
      suspendedUsers:
        allUsers?.filter((u) => u.status === "suspended").length || 0,
    };

    setStats(newStats);
  };

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "approved", is_active: true })
        .eq("id", userId);

      if (error) throw error;

      await loadData(); // Refresh data
      alert("User approved successfully!");
    } catch (error) {
      console.error("Error approving user:", error);
      alert("Error approving user");
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      await loadData(); // Refresh data
      alert("User rejected and removed successfully!");
    } catch (error) {
      console.error("Error rejecting user:", error);
      alert("Error rejecting user");
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus =
        currentStatus === "suspended" ? "approved" : "suspended";

      // When reactivating (unsuspending), also set is_active to true
      // When suspending, set is_active to false
      const updateData = {
        status: newStatus,
        is_active: newStatus === "approved",
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId);

      if (error) throw error;

      await loadData(); // Refresh data
      alert(
        `User ${
          newStatus === "suspended" ? "suspended" : "reactivated"
        } successfully!`
      );
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Error updating user status");
    }
  };

  const deleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      await loadData(); // Refresh data
      alert("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user");
    }
  };

  // Course Management Functions
  const loadCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select(
        `
        *,
        instructor:profiles!courses_instructor_id_fkey (
          first_name,
          last_name
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading courses:", error);
      return;
    }

    setCourses(data || []);
  };

  const loadInstructors = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "instructor")
        .order("last_name", { ascending: true });

      if (error) throw error;

      setInstructors(data || []);
    } catch (error) {
      console.error("Error loading instructors:", error);
    }
  };

  const loadAcademicTerms = async () => {
    const { data, error } = await supabase
      .from("academic_terms")
      .select("*")
      .order("academic_year", { ascending: false });

    if (error) {
      console.error("Error loading academic terms:", error);
      return;
    }

    setAcademicTerms(data || []);
  };

  const loadActivityLogs = async () => {
    try {
      setActivityLogsLoading(true);
      const filters = activityFilterType === "all" ? {} : { activityType: activityFilterType as any };
      const { data, error } = await getAllActivityLogs(filters);

      if (error) {
        console.error("Error loading activity logs:", error);
        return;
      }

      setActivityLogs(data || []);
    } catch (error) {
      console.error("Error in loadActivityLogs:", error);
    } finally {
      setActivityLogsLoading(false);
    }
  };

  const loadActivityLogStats = async () => {
    try {
      const { data, error } = await getActivityLogStats();

      if (error) {
        console.error("Error loading activity log stats:", error);
        return;
      }

      if (data) {
        setActivityLogStats(data);
      }
    } catch (error) {
      console.error("Error in loadActivityLogStats:", error);
    }
  };

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setCourseFormData({
      code: "",
      name: "",
      instructor_id: "",
      academic_term_id: academicTerms.find((t) => t.is_active)?.id || "",
      description: "",
      units: 3,
      schedule_days: [],
      schedule_time_start: "",
      schedule_time_end: "",
      room: "",
      max_students: 40,
      is_active: true,
    });
    setShowCourseForm(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseFormData({
      code: course.code,
      name: course.name,
      instructor_id: course.instructor_id,
      academic_term_id: course.academic_term_id,
      description: course.description || "",
      units: course.units,
      schedule_days: course.schedule_days || [],
      schedule_time_start: course.schedule_time_start,
      schedule_time_end: course.schedule_time_end,
      room: course.room || "",
      max_students: course.max_students || 40,
      is_active: course.is_active,
    });
    setShowCourseForm(true);
  };

  const handleSaveCourse = async () => {
    try {
      if (
        !courseFormData.code ||
        !courseFormData.name ||
        !courseFormData.instructor_id ||
        !courseFormData.academic_term_id
      ) {
        alert(
          "Please fill in all required fields (Course Code, Name, Instructor, Academic Term)"
        );
        return;
      }

      if (editingCourse) {
        // Update existing course
        const { error } = await supabase
          .from("courses")
          .update({
            code: courseFormData.code,
            name: courseFormData.name,
            instructor_id: courseFormData.instructor_id,
            academic_term_id: courseFormData.academic_term_id,
            description: courseFormData.description,
            units: courseFormData.units,
            schedule_days: courseFormData.schedule_days,
            schedule_time_start: courseFormData.schedule_time_start,
            schedule_time_end: courseFormData.schedule_time_end,
            room: courseFormData.room,
            max_students: courseFormData.max_students,
            is_active: courseFormData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingCourse.id);

        if (error) throw error;
        alert("Course updated successfully!");
      } else {
        // Create new course
        const { error } = await supabase.from("courses").insert({
          code: courseFormData.code,
          name: courseFormData.name,
          instructor_id: courseFormData.instructor_id,
          academic_term_id: courseFormData.academic_term_id,
          description: courseFormData.description,
          units: courseFormData.units,
          schedule_days: courseFormData.schedule_days,
          schedule_time_start: courseFormData.schedule_time_start,
          schedule_time_end: courseFormData.schedule_time_end,
          room: courseFormData.room,
          max_students: courseFormData.max_students,
          is_active: courseFormData.is_active,
        });

        if (error) throw error;
        alert("Course created successfully!");
      }

      await loadCourses();
      setShowCourseForm(false);
      setEditingCourse(null);
    } catch (error: any) {
      console.error("Error saving course:", error);
      alert(`Error saving course: ${error.message}`);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this course? This will also delete all enrollments and evaluations associated with it."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);

      if (error) throw error;

      await loadCourses();
      alert("Course deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting course:", error);
      alert(`Error deleting course: ${error.message}`);
    }
  };

  const handleCancelCourseForm = () => {
    setShowCourseForm(false);
    setEditingCourse(null);
  };

  const toggleScheduleDay = (day: string) => {
    setCourseFormData((prev) => ({
      ...prev,
      schedule_days: prev.schedule_days.includes(day)
        ? prev.schedule_days.filter((d) => d !== day)
        : [...prev.schedule_days, day],
    }));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Suspended
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "instructor":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Instructor
          </Badge>
        );
      case "student":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Student
          </Badge>
        );
      case "admin":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            Admin
          </Badge>
        );
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F5F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#344F1F] mx-auto mb-4"></div>
          <p className="text-[#344F1F]">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F5F0]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#F2EAD3] via-[#F9F5F0] to-[#F2EAD3] border-b-2 border-[#344F1F]/20 sticky top-0 z-50 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 sm:h-16 sm:w-16 ring-2 ring-[#F4991A] ring-offset-2 ring-offset-[#F9F5F0]">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-[#344F1F] text-[#F2EAD3] text-lg font-bold">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-black">
                  Admin Dashboard - Welcome, {user?.firstName || "Admin"}!
                </h1>
                <div className="flex items-center gap-2 text-black/70">
                  <Shield className="h-4 w-4 text-[#F4991A]" />
                  <span className="text-sm font-medium">
                    System Administrator
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="bg-white border-[#344F1F]/20 hover:bg-[#344F1F] hover:text-[#F2EAD3] transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-white border-[#344F1F]/20 flex-wrap h-auto gap-2 p-2">
            <TabsTrigger
              value="overview"
              currentValue={activeTab}
              onValueChange={setActiveTab}
              className="text-xs sm:text-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              currentValue={activeTab}
              onValueChange={setActiveTab}
              className="relative text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Pending Requests</span>
              <span className="sm:hidden">Pending</span>
              {stats.pendingRequests > 0 && (
                <Badge className="ml-1 sm:ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5">
                  {stats.pendingRequests}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="users"
              currentValue={activeTab}
              onValueChange={setActiveTab}
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Manage Users</span>
              <span className="sm:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger
              value="courses"
              currentValue={activeTab}
              onValueChange={setActiveTab}
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Manage Courses</span>
              <span className="sm:hidden">Courses</span>
            </TabsTrigger>
            <TabsTrigger
              value="activity-logs"
              currentValue={activeTab}
              onValueChange={setActiveTab}
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Activity Logs</span>
              <span className="sm:hidden">Logs</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent
            value="overview"
            currentValue={activeTab}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <Card className="bg-white border-[#344F1F]/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#344F1F]">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-[#F4991A]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#344F1F]">
                    {stats.totalUsers}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#344F1F]/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#344F1F]">
                    Pending Requests
                  </CardTitle>
                  <UserCheck className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.pendingRequests}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#344F1F]/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#344F1F]">
                    Active Instructors
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.activeInstructors}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#344F1F]/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#344F1F]">
                    Active Students
                  </CardTitle>
                  <Users className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.activeStudents}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#344F1F]/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#344F1F]">
                    Suspended Users
                  </CardTitle>
                  <UserX className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.suspendedUsers}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white border-[#344F1F]/20">
              <CardHeader>
                <CardTitle className="text-[#344F1F]">
                  Recent User Activity
                </CardTitle>
                <CardDescription>
                  Latest user registrations and status changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.slice(0, 5).map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-[#F9F5F0] rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-[#344F1F] text-[#F2EAD3] text-sm">
                            {user.first_name[0]}
                            {user.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-[#344F1F]">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Requests Tab */}
          <TabsContent
            value="pending"
            currentValue={activeTab}
            className="space-y-6"
          >
            <Card className="bg-white border-[#344F1F]/20">
              <CardHeader>
                <CardTitle className="text-[#344F1F]">
                  Pending Account Requests
                </CardTitle>
                <CardDescription>
                  Review and approve new account requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No pending requests</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">User</TableHead>
                          <TableHead className="whitespace-nowrap">Email</TableHead>
                          <TableHead className="whitespace-nowrap">Role</TableHead>
                          <TableHead className="whitespace-nowrap">Requested Date</TableHead>
                          <TableHead className="whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-[#344F1F] text-[#F2EAD3] text-sm">
                                    {user.first_name[0]}
                                    {user.last_name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium whitespace-nowrap">
                                  {user.first_name} {user.last_name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{user.email}</TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => approveUser(user.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  <span className="hidden sm:inline">Approve</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => rejectUser(user.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  <span className="hidden sm:inline">Reject</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Users Tab */}
          <TabsContent
            value="users"
            currentValue={activeTab}
            className="space-y-6"
          >
            {/* Filters */}
            <Card className="bg-white border-[#344F1F]/20">
              <CardHeader>
                <CardTitle className="text-[#344F1F]">
                  User Management
                </CardTitle>
                <CardDescription>
                  Search, filter, and manage user accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-[#344F1F]/20"
                    />
                  </div>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-[180px] border-[#344F1F]/20">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="instructor">Instructors</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px] border-[#344F1F]/20">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">User</TableHead>
                        <TableHead className="whitespace-nowrap">Email</TableHead>
                        <TableHead className="whitespace-nowrap">Role</TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                        <TableHead className="whitespace-nowrap">Join Date</TableHead>
                        <TableHead className="whitespace-nowrap">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-[#344F1F] text-[#F2EAD3] text-sm">
                                  {user.first_name[0]}
                                  {user.last_name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium whitespace-nowrap">
                                {user.first_name} {user.last_name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{user.email}</TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  toggleUserStatus(user.id, user.status)
                                }
                                className={
                                  user.status === "suspended"
                                    ? "text-green-600 hover:text-green-700"
                                    : "text-orange-600 hover:text-orange-700"
                                }
                              >
                                {user.status === "suspended" ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 sm:mr-1" />
                                    <span className="hidden sm:inline">Reactivate</span>
                                  </>
                                ) : (
                                  <>
                                    <UserX className="h-4 w-4 sm:mr-1" />
                                    <span className="hidden sm:inline">Suspend</span>
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No users found matching your criteria
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Courses Tab */}
          <TabsContent
            value="courses"
            currentValue={activeTab}
            className="space-y-6"
          >
            <Card className="bg-white border-[#344F1F]/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[#344F1F]">
                      Course Management
                    </CardTitle>
                    <CardDescription>
                      Create, edit, and manage courses and instructor
                      assignments
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleCreateCourse}
                    className="bg-[#344F1F] hover:bg-[#344F1F]/90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Course
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showCourseForm ? (
                  <div className="space-y-6 p-6 bg-[#F9F5F0] rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-[#344F1F]">
                        {editingCourse ? "Edit Course" : "Create New Course"}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelCourseForm}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="code">Course Code *</Label>
                        <Input
                          id="code"
                          value={courseFormData.code}
                          onChange={(e) =>
                            setCourseFormData({
                              ...courseFormData,
                              code: e.target.value,
                            })
                          }
                          placeholder="e.g., CS101"
                          className="border-[#344F1F]/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="name">Course Name *</Label>
                        <Input
                          id="name"
                          value={courseFormData.name}
                          onChange={(e) =>
                            setCourseFormData({
                              ...courseFormData,
                              name: e.target.value,
                            })
                          }
                          placeholder="e.g., Introduction to Programming"
                          className="border-[#344F1F]/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="instructor">Instructor *</Label>
                        <Select
                          value={courseFormData.instructor_id}
                          onValueChange={(value) =>
                            setCourseFormData({
                              ...courseFormData,
                              instructor_id: value,
                            })
                          }
                        >
                          <SelectTrigger className="border-[#344F1F]/20">
                            <SelectValue placeholder="Select instructor" />
                          </SelectTrigger>
                          <SelectContent>
                            {instructors.length === 0 ? (
                              <div className="p-2 text-sm text-gray-500">
                                No instructors available
                              </div>
                            ) : (
                              instructors.map((instructor) => (
                                <SelectItem
                                  key={instructor.id}
                                  value={instructor.id}
                                >
                                  {instructor.first_name} {instructor.last_name}
                                  {instructor.status === "pending" && (
                                    <span className="text-xs text-yellow-600 ml-2">
                                      (Pending)
                                    </span>
                                  )}
                                  {instructor.status === "suspended" && (
                                    <span className="text-xs text-red-600 ml-2">
                                      (Suspended)
                                    </span>
                                  )}
                                  {!instructor.is_active && (
                                    <span className="text-xs text-gray-600 ml-2">
                                      (Inactive)
                                    </span>
                                  )}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="term">Academic Term *</Label>
                        <Select
                          value={courseFormData.academic_term_id}
                          onValueChange={(value) =>
                            setCourseFormData({
                              ...courseFormData,
                              academic_term_id: value,
                            })
                          }
                        >
                          <SelectTrigger className="border-[#344F1F]/20">
                            <SelectValue placeholder="Select term" />
                          </SelectTrigger>
                          <SelectContent>
                            {academicTerms.length === 0 ? (
                              <div className="p-2 text-sm text-gray-500">
                                No academic terms available. Create one first.
                              </div>
                            ) : (
                              academicTerms.map((term) => (
                                <SelectItem key={term.id} value={term.id}>
                                  {term.semester} - {term.academic_year}
                                  {term.is_active && (
                                    <span className="text-xs text-green-600 ml-2">
                                      (Active)
                                    </span>
                                  )}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="units">Units</Label>
                        <Input
                          id="units"
                          type="number"
                          value={courseFormData.units}
                          onChange={(e) =>
                            setCourseFormData({
                              ...courseFormData,
                              units: parseInt(e.target.value) || 3,
                            })
                          }
                          className="border-[#344F1F]/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="room">Room</Label>
                        <Input
                          id="room"
                          value={courseFormData.room}
                          onChange={(e) =>
                            setCourseFormData({
                              ...courseFormData,
                              room: e.target.value,
                            })
                          }
                          placeholder="e.g., Room 301"
                          className="border-[#344F1F]/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="start_time">Start Time</Label>
                        <Input
                          id="start_time"
                          type="time"
                          value={courseFormData.schedule_time_start}
                          onChange={(e) =>
                            setCourseFormData({
                              ...courseFormData,
                              schedule_time_start: e.target.value,
                            })
                          }
                          className="border-[#344F1F]/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="end_time">End Time</Label>
                        <Input
                          id="end_time"
                          type="time"
                          value={courseFormData.schedule_time_end}
                          onChange={(e) =>
                            setCourseFormData({
                              ...courseFormData,
                              schedule_time_end: e.target.value,
                            })
                          }
                          className="border-[#344F1F]/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max_students">Max Students</Label>
                        <Input
                          id="max_students"
                          type="number"
                          value={courseFormData.max_students}
                          onChange={(e) =>
                            setCourseFormData({
                              ...courseFormData,
                              max_students: parseInt(e.target.value) || 40,
                            })
                          }
                          className="border-[#344F1F]/20"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Schedule Days</Label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                          ].map((day) => (
                            <Button
                              key={day}
                              type="button"
                              variant={
                                courseFormData.schedule_days.includes(day)
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => toggleScheduleDay(day)}
                              className={
                                courseFormData.schedule_days.includes(day)
                                  ? "bg-[#344F1F] text-white"
                                  : ""
                              }
                            >
                              {day.substring(0, 3)}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={courseFormData.description}
                          onChange={(e) =>
                            setCourseFormData({
                              ...courseFormData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Course description..."
                          className="border-[#344F1F]/20"
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_active"
                          checked={courseFormData.is_active}
                          onChange={(e) =>
                            setCourseFormData({
                              ...courseFormData,
                              is_active: e.target.checked,
                            })
                          }
                          className="rounded border-[#344F1F]/20"
                        />
                        <Label htmlFor="is_active" className="cursor-pointer">
                          Active Course
                        </Label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                      <Button
                        variant="outline"
                        onClick={handleCancelCourseForm}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveCourse}
                        className="bg-[#344F1F] hover:bg-[#344F1F]/90 text-white"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {editingCourse ? "Update Course" : "Create Course"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {courses.length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No courses created yet</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Course Name</TableHead>
                            <TableHead>Instructor</TableHead>
                            <TableHead>Schedule</TableHead>
                            <TableHead>Room</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {courses.map((course) => (
                            <TableRow key={course.id}>
                              <TableCell className="font-medium">
                                {course.code}
                              </TableCell>
                              <TableCell>{course.name}</TableCell>
                              <TableCell>
                                {course.instructor
                                  ? `${course.instructor.first_name} ${course.instructor.last_name}`
                                  : "N/A"}
                              </TableCell>
                              <TableCell>
                                {course.schedule_days &&
                                course.schedule_days.length > 0
                                  ? course.schedule_days
                                      .map((d) => d.substring(0, 3))
                                      .join(", ")
                                  : "N/A"}
                                {course.schedule_time_start && (
                                  <div className="text-xs text-gray-500">
                                    {course.schedule_time_start} -{" "}
                                    {course.schedule_time_end}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>{course.room || "N/A"}</TableCell>
                              <TableCell>
                                {course.is_active ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-800">
                                    Inactive
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditCourse(course)}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleDeleteCourse(course.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent
            value="activity-logs"
            currentValue={activeTab}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-white border-[#344F1F]/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#344F1F]">
                    Total Activities
                  </CardTitle>
                  <Activity className="h-4 w-4 text-[#344F1F]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#344F1F]">
                    {activityLogStats.totalActivities}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    All time activities
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#344F1F]/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#344F1F]">
                    Today's Activities
                  </CardTitle>
                  <Clock className="h-4 w-4 text-[#344F1F]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#344F1F]">
                    {activityLogStats.todayActivities}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Activities in the last 24 hours
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#344F1F]/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#344F1F]">
                    Instant Setup Requests
                  </CardTitle>
                  <Users className="h-4 w-4 text-[#344F1F]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#344F1F]">
                    {activityLogStats.instantSetupRequests}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Landing page requests
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Activity Logs Table */}
            <Card className="bg-white border-[#344F1F]/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[#344F1F]">
                      Activity Logs
                    </CardTitle>
                    <CardDescription>
                      Monitor all user activities, admin actions, and system events
                    </CardDescription>
                  </div>
                  <Select
                    value={activityFilterType}
                    onValueChange={setActivityFilterType}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Activities</SelectItem>
                      <SelectItem value="user_registered">User Registrations</SelectItem>
                      <SelectItem value="user_approved">User Approvals</SelectItem>
                      <SelectItem value="user_suspended">User Suspensions</SelectItem>
                      <SelectItem value="user_reactivated">User Reactivations</SelectItem>
                      <SelectItem value="instant_setup_request">Instant Setup Requests</SelectItem>
                      <SelectItem value="student_enrolled">Student Enrollments (Self)</SelectItem>
                      <SelectItem value="instructor_added_student">Instructor Added Student</SelectItem>
                      <SelectItem value="evaluation_submitted">Evaluation Submissions</SelectItem>
                      <SelectItem value="ai_analysis_requested">AI Analysis Requests</SelectItem>
                      <SelectItem value="profile_updated">Profile Updates</SelectItem>
                      <SelectItem value="course_created">Course Created</SelectItem>
                      <SelectItem value="course_updated">Course Updated</SelectItem>
                      <SelectItem value="course_deleted">Course Deleted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {activityLogsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading activity logs...</p>
                  </div>
                ) : activityLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No activities recorded yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Activity Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>User/Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Performed By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activityLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">
                            {new Date(log.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                log.activity_type === "user_registered"
                                  ? "bg-blue-100 text-blue-800"
                                  : log.activity_type === "user_approved"
                                  ? "bg-green-100 text-green-800"
                                  : log.activity_type === "user_suspended"
                                  ? "bg-red-100 text-red-800"
                                  : log.activity_type === "user_reactivated"
                                  ? "bg-purple-100 text-purple-800"
                                  : log.activity_type === "instant_setup_request"
                                  ? "bg-orange-100 text-orange-800"
                                  : log.activity_type === "student_enrolled"
                                  ? "bg-cyan-100 text-cyan-800"
                                  : log.activity_type === "instructor_added_student"
                                  ? "bg-teal-100 text-teal-800"
                                  : log.activity_type === "evaluation_submitted"
                                  ? "bg-indigo-100 text-indigo-800"
                                  : log.activity_type === "ai_analysis_requested"
                                  ? "bg-fuchsia-100 text-fuchsia-800"
                                  : log.activity_type === "profile_updated"
                                  ? "bg-lime-100 text-lime-800"
                                  : log.activity_type === "course_created"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : log.activity_type === "course_updated"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : log.activity_type === "course_deleted"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {log.activity_type.replace(/_/g, " ").toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{log.activity_description}</TableCell>
                          <TableCell>
                            {log.user_email || "N/A"}
                          </TableCell>
                          <TableCell>
                            {log.user_role ? (
                              <Badge variant="outline">
                                {log.user_role}
                              </Badge>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell>
                            {log.performed_by_email ? (
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {log.performed_by_email}
                                </span>
                                {log.performed_by_role && (
                                  <Badge variant="secondary" className="w-fit mt-1">
                                    {log.performed_by_role}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">System</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white border-[#344F1F]/20">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-[#344F1F]">
                    User Registrations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#344F1F]">
                    {activityLogStats.userRegistrations}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#344F1F]/20">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-[#344F1F]">
                    User Approvals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {activityLogStats.userApprovals}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#344F1F]/20">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-[#344F1F]">
                    User Suspensions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {activityLogStats.userSuspensions}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
