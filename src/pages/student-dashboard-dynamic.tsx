"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/supabase-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Star,
  MapPin,
  BookOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  UserCircle,
  X,
  Save,
} from "lucide-react";

interface InstructorCourse {
  id: string;
  code: string;
  name: string;
  instructor_id: string;
  academic_term_id: string;
  instructor_name: string;
  department: string;
  office_location: string;
  rating: number;
  totalEvaluations: number;
  hasEvaluated: boolean;
}

interface EvaluationData {
  // Section A: Communication & Information (15%)
  a1_syllabus: number;
  a2_makeup_classes: number;
  a3_online_platform: number;
  a4_synchronous_activity: number;
  a5_tech_support: number;
  a6_communication: number;
  a7_tools_used: string;

  // Section B: Instruction & Learning (25%)
  b1_course_content: number;
  b2_lectures: number;
  b3_assignments: number;
  b4_subject_matter: number;
  b5_access_materials: number;
  b6_submission_instructions: number;
  b7_lecture_forms: string;

  // Section C: Engagement & Consultation (15%)
  c1_office_hours: number;
  c2_discussion_boards: number;
  c3_group_interaction: number;
  c4_engagement: number;
  c5_consultation: number;
  c6_class_discussion: number;
  c7_strategies: string;

  // Section D: Assessment & Academic Integrity (25%)
  d1_assessment_tasks: number;
  d2_assessment_tools: number;
  d3_exam_integrity: number;
  d4_varied_assessments: number;
  d5_feedback: number;
  d6_academic_integrity: number;
  d7a_learning_experiences: string;
  d7b_relevant_requirements: string;

  // Section E: General Assessment (20%)
  e1_recommendation: number;
  e2_comments: string;
}

interface StudentProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
}

interface StudentDetails {
  student_number: string;
  program: string;
  year_level: number | null;
}

const ratingScale = {
  5: "Excellent (90-100%) - Exceeds expectations significantly",
  4: "Good (80-89%) - Meets expectations well",
  3: "Satisfactory (70-79%) - Meets basic expectations",
  2: "Needs Improvement (60-69%) - Below expectations",
  1: "Unsatisfactory (0-59%) - Well below expectations",
};

const sections = [
  "Communication & Information (15%)",
  "Instruction & Learning (25%)",
  "Engagement & Consultation (15%)",
  "Assessment & Academic Integrity (25%)",
  "General Assessment (20%)",
];

const sectionAQuestions = [
  {
    key: "a1_syllabus",
    label:
      "The course syllabus was explained/distributed/made available for access/reference.",
  },
  {
    key: "a2_makeup_classes",
    label: "Makeup classes were conducted/announced for interrupted meetings.",
  },
  {
    key: "a3_online_platform",
    label:
      "An online platform was utilized to inform/remind us of any course tasks.",
  },
  {
    key: "a4_synchronous_activity",
    label:
      "I was aware of/had attended synchronous or its equivalent asynchronous teaching activity.",
  },
  {
    key: "a5_tech_support",
    label:
      "I was guided with the technology support/module instruction that I needed.",
  },
  {
    key: "a6_communication",
    label:
      "I know my instructor is in this course because we were communicating as a group/individually",
  },
];

const sectionBQuestions = [
  {
    key: "b1_course_content",
    label:
      "Course content/materials updates and requirements were discussed and/or posted on various platforms for dissemination.",
  },
  {
    key: "b2_lectures",
    label:
      "Lectures were supplemented with learning activities and flow/inputs from my instructor.",
  },
  {
    key: "b3_assignments",
    label:
      "Accomplishment/submission of assignments/course requirements was reasonable & flexible.",
  },
  {
    key: "b4_subject_matter",
    label: "The subject matter appeared well to the level of my understanding.",
  },
  {
    key: "b5_access_materials",
    label:
      "I was able to access learning materials/resources within the timeframe.",
  },
  {
    key: "b6_submission_instructions",
    label:
      "I was provided with access and clear instructions on the submission of course requirements.",
  },
];

const sectionCQuestions = [
  {
    key: "c1_office_hours",
    label:
      "The schedule of virtual office hours with the consultation of my instructor had been posted/announced.",
  },
  {
    key: "c2_discussion_boards",
    label:
      "Discussion boards and platforms were provided for class and/or group interaction.",
  },
  {
    key: "c3_group_interaction",
    label:
      "Group/class interaction was properly guided with worksheets and other learning resources.",
  },
  {
    key: "c4_engagement",
    label:
      "The different forms of online/offline interaction allowed me to engage and enjoy learning.",
  },
  {
    key: "c5_consultation",
    label:
      "I was able to consult with my instructor through the information given on how to reach her/him.",
  },
  {
    key: "c6_class_discussion",
    label:
      "Class interaction/discussion encouraged me to contribute knowledge/experience towards better understanding.",
  },
];

const sectionDQuestions = [
  {
    key: "d1_assessment_tasks",
    label:
      "Online/offline assessment tasks and requirements were given/explained with a reasonable timeframe.",
  },
  {
    key: "d2_assessment_tools",
    label:
      "The assessment tools such as test questionnaire and/or rubrics were stated/explained clearly.",
  },
  {
    key: "d3_exam_integrity",
    label:
      "Proctored online exam/test was conducted with utmost care to preserve academic integrity/honesty.",
  },
  {
    key: "d4_varied_assessments",
    label:
      "Varied assessments through online/offline drills, exercises, and assignments motivated me.",
  },
  {
    key: "d5_feedback",
    label:
      "The timely feedback on my learning assessments helped me improve in succeeding assessments.",
  },
  {
    key: "d6_academic_integrity",
    label:
      "I learned to uphold academic integrity in the assessment or test-taking activity in this course.",
  },
];

const sectionEQuestions = [
  {
    key: "e1_recommendation",
    label: "Will you recommend this faculty/instructor to other students?",
  },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<InstructorCourse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [evaluatingCourse, setEvaluatingCourse] =
    useState<InstructorCourse | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState<{
    profile: StudentProfile | null;
    details: StudentDetails | null;
  }>({
    profile: null,
    details: null,
  });

  const [evaluationData, setEvaluationData] = useState<EvaluationData>({
    a1_syllabus: 0,
    a2_makeup_classes: 0,
    a3_online_platform: 0,
    a4_synchronous_activity: 0,
    a5_tech_support: 0,
    a6_communication: 0,
    a7_tools_used: "",
    b1_course_content: 0,
    b2_lectures: 0,
    b3_assignments: 0,
    b4_subject_matter: 0,
    b5_access_materials: 0,
    b6_submission_instructions: 0,
    b7_lecture_forms: "",
    c1_office_hours: 0,
    c2_discussion_boards: 0,
    c3_group_interaction: 0,
    c4_engagement: 0,
    c5_consultation: 0,
    c6_class_discussion: 0,
    c7_strategies: "",
    d1_assessment_tasks: 0,
    d2_assessment_tools: 0,
    d3_exam_integrity: 0,
    d4_varied_assessments: 0,
    d5_feedback: 0,
    d6_academic_integrity: 0,
    d7a_learning_experiences: "",
    d7b_relevant_requirements: "",
    e1_recommendation: 0,
    e2_comments: "",
  });

  useEffect(() => {
    if (user?.id) {
      fetchEnrolledCourses();
    }
  }, [user]);

  useEffect(() => {
    const filtered = courses.filter(
      (course) =>
        course.instructor_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        course.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [searchQuery, courses]);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);

      // Get enrollments with course and instructor details
      const { data: enrollments, error: enrollError } = await supabase
        .from("enrollments")
        .select(
          `
          course_id,
          courses (
            id,
            code,
            name,
            instructor_id,
            academic_term_id
          )
        `
        )
        .eq("student_id", user!.id)
        .eq("status", "enrolled");

      if (enrollError) throw enrollError;

      if (!enrollments || enrollments.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }

      // Get unique instructor IDs
      const instructorIds = [
        ...new Set(enrollments.map((e: any) => e.courses?.instructor_id)),
      ];

      // Fetch instructor details
      const { data: instructors, error: instructorError } = await supabase
        .from("profiles")
        .select(
          `
          id,
          first_name,
          last_name,
          instructor_details (
            department,
            office_location
          )
        `
        )
        .in("id", instructorIds);

      if (instructorError) throw instructorError;

      // Create instructor map
      const instructorMap = new Map(
        instructors?.map((inst: any) => [
          inst.id,
          {
            name: `${inst.first_name} ${inst.last_name}`,
            department: inst.instructor_details?.department || "N/A",
            office_location: inst.instructor_details?.office_location || "N/A",
          },
        ])
      );

      // Check existing evaluations
      const courseIds = enrollments
        .map((e: any) => e.courses?.id)
        .filter(Boolean);
      const { data: existingEvals, error: evalsError } = await supabase
        .from("evaluations")
        .select("course_id, id")
        .eq("student_id", user!.id)
        .in("course_id", courseIds);

      if (evalsError) throw evalsError;

      const evaluatedCourseIds = new Set(
        existingEvals?.map((e) => e.course_id) || []
      );

      // Get evaluation counts and ratings for each course
      const coursesWithStats = await Promise.all(
        enrollments.map(async (enrollment: any) => {
          const course = enrollment.courses;
          if (!course) return null;

          const instructor = instructorMap.get(course.instructor_id);

          // Get evaluation count and average rating for this course
          const { data: courseEvals, error: courseEvalsError } = await supabase
            .from("evaluations")
            .select("id")
            .eq("course_id", course.id)
            .eq("status", "submitted");

          if (courseEvalsError) {
            console.error(
              "Error fetching course evaluations:",
              courseEvalsError
            );
          }

          const totalEvaluations = courseEvals?.length || 0;
          let averageRating = 0;

          if (totalEvaluations > 0 && courseEvals) {
            const evalIds = courseEvals.map((e) => e.id);
            const { data: ratings, error: ratingsError } = await supabase
              .from("evaluation_ratings")
              .select("*")
              .in("evaluation_id", evalIds);

            if (ratingsError) {
              console.error("Error fetching ratings:", ratingsError);
            } else if (ratings && ratings.length > 0) {
              // Calculate average across all rating fields
              const allRatings = ratings.flatMap((r) =>
                [
                  r.teaching_clarity,
                  r.teaching_engagement,
                  r.teaching_knowledge,
                  r.teaching_organization,
                  r.teaching_feedback,
                  r.materials_quality,
                  r.materials_relevance,
                  r.materials_accessibility,
                  r.materials_variety,
                  r.materials_timeliness,
                  r.communication_availability,
                  r.communication_responsiveness,
                  r.communication_clarity,
                  r.communication_helpfulness,
                  r.communication_approachability,
                ].filter((val) => val > 0)
              );

              if (allRatings.length > 0) {
                averageRating =
                  allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
              }
            }
          }

          return {
            id: course.id,
            code: course.code,
            name: course.name,
            instructor_id: course.instructor_id,
            academic_term_id: course.academic_term_id,
            instructor_name: instructor?.name || "Unknown Instructor",
            department: instructor?.department || "N/A",
            office_location: instructor?.office_location || "N/A",
            rating: averageRating,
            totalEvaluations,
            hasEvaluated: evaluatedCourseIds.has(course.id),
          };
        })
      );

      setCourses(coursesWithStats.filter(Boolean) as InstructorCourse[]);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateClick = (course: InstructorCourse) => {
    setEvaluatingCourse(course);
    setShowEvaluationForm(true);
    setCurrentSection(0);
    // Reset evaluation data
    setEvaluationData({
      a1_syllabus: 0,
      a2_makeup_classes: 0,
      a3_online_platform: 0,
      a4_synchronous_activity: 0,
      a5_tech_support: 0,
      a6_communication: 0,
      a7_tools_used: "",
      b1_course_content: 0,
      b2_lectures: 0,
      b3_assignments: 0,
      b4_subject_matter: 0,
      b5_access_materials: 0,
      b6_submission_instructions: 0,
      b7_lecture_forms: "",
      c1_office_hours: 0,
      c2_discussion_boards: 0,
      c3_group_interaction: 0,
      c4_engagement: 0,
      c5_consultation: 0,
      c6_class_discussion: 0,
      c7_strategies: "",
      d1_assessment_tasks: 0,
      d2_assessment_tools: 0,
      d3_exam_integrity: 0,
      d4_varied_assessments: 0,
      d5_feedback: 0,
      d6_academic_integrity: 0,
      d7a_learning_experiences: "",
      d7b_relevant_requirements: "",
      e1_recommendation: 0,
      e2_comments: "",
    });
  };

  const handleCloseEvaluation = () => {
    setShowEvaluationForm(false);
    setEvaluatingCourse(null);
    setCurrentSection(0);
  };

  const handleRatingChange = (key: keyof EvaluationData, value: number) => {
    setEvaluationData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCommentChange = (key: keyof EvaluationData, value: string) => {
    setEvaluationData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!evaluatingCourse) return;

    setIsSubmitting(true);
    try {
      // Create evaluation record
      const { data: evaluation, error: evalError } = await supabase
        .from("evaluations")
        .insert({
          student_id: user!.id,
          course_id: evaluatingCourse.id,
          academic_term_id: evaluatingCourse.academic_term_id,
          is_anonymous: false,
          status: "submitted",
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (evalError) throw evalError;

      // Insert ratings
      const { error: ratingsError } = await supabase
        .from("evaluation_ratings")
        .insert({
          evaluation_id: evaluation.id,
          teaching_clarity: evaluationData.a1_syllabus,
          teaching_engagement: evaluationData.a2_makeup_classes,
          teaching_knowledge: evaluationData.a3_online_platform,
          teaching_organization: evaluationData.a4_synchronous_activity,
          teaching_feedback: evaluationData.a5_tech_support,
          materials_quality: evaluationData.b1_course_content,
          materials_relevance: evaluationData.b2_lectures,
          materials_accessibility: evaluationData.b3_assignments,
          materials_variety: evaluationData.b4_subject_matter,
          materials_timeliness: evaluationData.b5_access_materials,
          communication_availability: evaluationData.c1_office_hours,
          communication_responsiveness: evaluationData.c2_discussion_boards,
          communication_clarity: evaluationData.c3_group_interaction,
          communication_helpfulness: evaluationData.c4_engagement,
          communication_approachability: evaluationData.c5_consultation,
        });

      if (ratingsError) throw ratingsError;

      // Insert comments
      const { error: commentsError } = await supabase
        .from("evaluation_comments")
        .insert({
          evaluation_id: evaluation.id,
          teaching_comments: evaluationData.a7_tools_used,
          materials_comments: evaluationData.b7_lecture_forms,
          communication_comments: evaluationData.c7_strategies,
          general_comments: `Learning Experiences: ${evaluationData.d7a_learning_experiences}\n\nRelevant Requirements: ${evaluationData.d7b_relevant_requirements}\n\nRecommendation (${evaluationData.e1_recommendation}/5): ${evaluationData.e2_comments}`,
        });

      if (commentsError) throw commentsError;

      alert("Evaluation submitted successfully!");
      handleCloseEvaluation();
      fetchEnrolledCourses(); // Refresh the list
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      alert("Error submitting evaluation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCurrentSectionComplete = () => {
    const getCurrentSectionQuestions = () => {
      switch (currentSection) {
        case 0:
          return sectionAQuestions.map((q) => q.key);
        case 1:
          return sectionBQuestions.map((q) => q.key);
        case 2:
          return sectionCQuestions.map((q) => q.key);
        case 3:
          return sectionDQuestions.map((q) => q.key);
        case 4:
          return sectionEQuestions.map((q) => q.key);
        default:
          return [];
      }
    };

    return getCurrentSectionQuestions().every((key) => {
      const value = evaluationData[key as keyof EvaluationData];
      return typeof value === "number" ? value > 0 : true;
    });
  };

  const renderHorizontalLikertScale = (
    index: number,
    questionKey: keyof EvaluationData,
    label: string
  ) => (
    <tr
      key={questionKey}
      className="border-b border-[#344F1F]/20 last:border-b-0"
    >
      <td className="py-4 px-4 text-sm text-black/80">{label}</td>
      {[1, 2, 3, 4, 5].map((rating) => (
        <td key={rating} className="py-4 px-2 text-center">
          <input
            type="radio"
            name={questionKey}
            value={rating}
            checked={evaluationData[questionKey] === rating}
            onChange={() => handleRatingChange(questionKey, rating)}
            className="w-5 h-5 cursor-pointer accent-[#344F1F]"
          />
        </td>
      ))}
    </tr>
  );

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Profile Management Functions
  const loadProfile = async () => {
    if (!user?.id) return;

    setProfileLoading(true);
    try {
      // Fetch profile and student details
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, first_name, last_name, email, avatar_url, student_details(*)"
        )
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        const details = Array.isArray(data.student_details)
          ? data.student_details[0]
          : data.student_details;

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
                student_number: details.student_number,
                program: details.program,
                year_level: details.year_level,
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

      // Update student_details table
      if (profileData.details) {
        const { error: detailsError } = await supabase
          .from("student_details")
          .update({
            student_number: profileData.details.student_number,
            program: profileData.details.program,
            year_level: profileData.details.year_level,
          })
          .eq("id", user.id);

        if (detailsError) throw detailsError;
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

  const handleProfileChange = (field: string, value: string | number) => {
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
          [field]: field === "year_level" ? Number(value) : value,
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F5F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#344F1F] mx-auto mb-4"></div>
          <p className="text-[#344F1F]">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (showEvaluationForm && evaluatingCourse) {
    return (
      <div className="min-h-screen bg-[#F9F5F0]">
        {/* Evaluation Form Header */}
        <header className="bg-gradient-to-r from-[#F2EAD3] via-[#F9F5F0] to-[#F2EAD3] border-b-2 border-[#344F1F]/20 sticky top-0 z-50 shadow-sm">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[#344F1F]">
                  Instructor Evaluation
                </h1>
                <p className="text-sm text-black/60 mt-1">
                  {evaluatingCourse.code} - {evaluatingCourse.name}
                </p>
                <p className="text-sm text-black/60">
                  Instructor: {evaluatingCourse.instructor_name}
                </p>
              </div>
              <Button
                onClick={handleCloseEvaluation}
                variant="outline"
                className="border-[#344F1F]/20"
              >
                Close
              </Button>
            </div>
          </div>
        </header>

        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Indicator */}
          <Card className="mb-6 bg-white border-[#344F1F]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#344F1F]">
                  Section {currentSection + 1} of {sections.length}
                </h3>
                <span className="text-sm text-black/60">
                  {Math.round(((currentSection + 1) / sections.length) * 100)}%
                  Complete
                </span>
              </div>
              <Progress
                value={((currentSection + 1) / sections.length) * 100}
                className="h-2"
              />
              <p className="text-sm text-[#344F1F] mt-2 font-medium">
                {sections[currentSection]}
              </p>
            </CardContent>
          </Card>

          {/* Section A */}
          {currentSection === 0 && (
            <Card className="bg-white border-[#344F1F]/20">
              <CardHeader>
                <CardTitle className="text-[#344F1F]">
                  Communication & Information (15%)
                </CardTitle>
                <CardDescription>
                  Rate the following aspects of communication and information
                  delivery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-[#344F1F]/20">
                        <th className="text-left py-3 px-4 font-semibold text-[#344F1F]">
                          Question
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          1
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          2
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          3
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          4
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          5
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectionAQuestions.map((q, idx) =>
                        renderHorizontalLikertScale(
                          idx,
                          q.key as keyof EvaluationData,
                          q.label
                        )
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6">
                  <Label
                    htmlFor="a7_tools_used"
                    className="text-[#344F1F] font-medium"
                  >
                    7. What tools/platform/s did the instructor use to deliver
                    the course?
                  </Label>
                  <Textarea
                    id="a7_tools_used"
                    value={evaluationData.a7_tools_used}
                    onChange={(e) =>
                      handleCommentChange("a7_tools_used", e.target.value)
                    }
                    className="mt-2 border-[#344F1F]/20"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section B */}
          {currentSection === 1 && (
            <Card className="bg-white border-[#344F1F]/20">
              <CardHeader>
                <CardTitle className="text-[#344F1F]">
                  Instruction & Learning (25%)
                </CardTitle>
                <CardDescription>
                  Rate the quality of instruction and learning materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-[#344F1F]/20">
                        <th className="text-left py-3 px-4 font-semibold text-[#344F1F]">
                          Question
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          1
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          2
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          3
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          4
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          5
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectionBQuestions.map((q, idx) =>
                        renderHorizontalLikertScale(
                          idx,
                          q.key as keyof EvaluationData,
                          q.label
                        )
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6">
                  <Label
                    htmlFor="b7_lecture_forms"
                    className="text-[#344F1F] font-medium"
                  >
                    7. What forms of lecture did the instructor use in this
                    course?
                  </Label>
                  <Textarea
                    id="b7_lecture_forms"
                    value={evaluationData.b7_lecture_forms}
                    onChange={(e) =>
                      handleCommentChange("b7_lecture_forms", e.target.value)
                    }
                    className="mt-2 border-[#344F1F]/20"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section C */}
          {currentSection === 2 && (
            <Card className="bg-white border-[#344F1F]/20">
              <CardHeader>
                <CardTitle className="text-[#344F1F]">
                  Engagement & Consultation (15%)
                </CardTitle>
                <CardDescription>
                  Rate instructor engagement and accessibility
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-[#344F1F]/20">
                        <th className="text-left py-3 px-4 font-semibold text-[#344F1F]">
                          Question
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          1
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          2
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          3
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          4
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          5
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectionCQuestions.map((q, idx) =>
                        renderHorizontalLikertScale(
                          idx,
                          q.key as keyof EvaluationData,
                          q.label
                        )
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6">
                  <Label
                    htmlFor="c7_strategies"
                    className="text-[#344F1F] font-medium"
                  >
                    7. What engagement strategies did your instructor use?
                  </Label>
                  <Textarea
                    id="c7_strategies"
                    value={evaluationData.c7_strategies}
                    onChange={(e) =>
                      handleCommentChange("c7_strategies", e.target.value)
                    }
                    className="mt-2 border-[#344F1F]/20"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section D */}
          {currentSection === 3 && (
            <Card className="bg-white border-[#344F1F]/20">
              <CardHeader>
                <CardTitle className="text-[#344F1F]">
                  Assessment & Academic Integrity (25%)
                </CardTitle>
                <CardDescription>
                  Rate assessment methods and academic integrity practices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-[#344F1F]/20">
                        <th className="text-left py-3 px-4 font-semibold text-[#344F1F]">
                          Question
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          1
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          2
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          3
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          4
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          5
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectionDQuestions.map((q, idx) =>
                        renderHorizontalLikertScale(
                          idx,
                          q.key as keyof EvaluationData,
                          q.label
                        )
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 space-y-4">
                  <div>
                    <Label
                      htmlFor="d7a_learning_experiences"
                      className="text-[#344F1F] font-medium"
                    >
                      7a. What learning experiences were most valuable in this
                      course?
                    </Label>
                    <Textarea
                      id="d7a_learning_experiences"
                      value={evaluationData.d7a_learning_experiences}
                      onChange={(e) =>
                        handleCommentChange(
                          "d7a_learning_experiences",
                          e.target.value
                        )
                      }
                      className="mt-2 border-[#344F1F]/20"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="d7b_relevant_requirements"
                      className="text-[#344F1F] font-medium"
                    >
                      7b. What course requirements were most relevant to your
                      learning?
                    </Label>
                    <Textarea
                      id="d7b_relevant_requirements"
                      value={evaluationData.d7b_relevant_requirements}
                      onChange={(e) =>
                        handleCommentChange(
                          "d7b_relevant_requirements",
                          e.target.value
                        )
                      }
                      className="mt-2 border-[#344F1F]/20"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section E */}
          {currentSection === 4 && (
            <Card className="bg-white border-[#344F1F]/20">
              <CardHeader>
                <CardTitle className="text-[#344F1F]">
                  General Assessment (20%)
                </CardTitle>
                <CardDescription>
                  Overall evaluation and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-[#344F1F]/20">
                        <th className="text-left py-3 px-4 font-semibold text-[#344F1F]">
                          Question
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          1
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          2
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          3
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          4
                        </th>
                        <th className="text-center py-3 px-2 font-semibold text-[#344F1F] w-16">
                          5
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectionEQuestions.map((q, idx) =>
                        renderHorizontalLikertScale(
                          idx,
                          q.key as keyof EvaluationData,
                          q.label
                        )
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6">
                  <Label
                    htmlFor="e2_comments"
                    className="text-[#344F1F] font-medium"
                  >
                    2. Additional Comments and Suggestions
                  </Label>
                  <Textarea
                    id="e2_comments"
                    value={evaluationData.e2_comments}
                    onChange={(e) =>
                      handleCommentChange("e2_comments", e.target.value)
                    }
                    className="mt-2 border-[#344F1F]/20"
                    rows={5}
                    placeholder="Share any additional feedback, suggestions, or comments about the course and instructor..."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
              variant="outline"
              className="border-[#344F1F]/20"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentSection < sections.length - 1 ? (
              <Button
                onClick={() => setCurrentSection(currentSection + 1)}
                disabled={!isCurrentSectionComplete()}
                className="bg-[#344F1F] hover:bg-[#344F1F]/90 text-[#F2EAD3]"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isCurrentSectionComplete() || isSubmitting}
                className="bg-[#F4991A] hover:bg-[#F4991A]/90 text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Submit Evaluation
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Rating Scale Reference */}
          <Card className="mt-6 bg-[#F9F5F0] border-[#344F1F]/20">
            <CardHeader>
              <CardTitle className="text-sm text-[#344F1F]">
                Rating Scale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-xs">
                {Object.entries(ratingScale).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <span className="font-semibold text-[#344F1F] w-4">
                      {key}:
                    </span>
                    <span className="text-black/70">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F5F0]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#F2EAD3] via-[#F9F5F0] to-[#F2EAD3] border-b-2 border-[#344F1F]/20 sticky top-0 z-50 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-[#F4991A] ring-offset-2 ring-offset-[#F9F5F0]">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-gradient-to-br from-[#344F1F] to-[#344F1F]/80 text-[#F2EAD3] font-bold text-lg">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-[#344F1F]">
                  Welcome, {user?.firstName}!
                </h1>
                <p className="text-black/60">Student Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
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
                    className="bg-white border-[#344F1F]/20 hover:bg-[#344F1F] hover:text-[#F2EAD3] transition-colors"
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
                            Student Profile
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

                      {/* Student Details */}
                      <div className="space-y-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-8 w-1 bg-gradient-to-b from-[#F4991A] to-[#e08915] rounded-full"></div>
                          <h3 className="text-lg font-bold text-[#344F1F]">
                            Student Details
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="student_number"
                              className="text-sm font-semibold text-gray-700"
                            >
                              Student Number
                            </Label>
                            {isEditingProfile ? (
                              <Input
                                id="student_number"
                                value={
                                  profileData.details?.student_number || ""
                                }
                                onChange={(e) =>
                                  handleProfileChange(
                                    "student_number",
                                    e.target.value
                                  )
                                }
                                className="border-2 border-gray-200 focus:border-[#F4991A] focus:ring-2 focus:ring-[#F4991A]/20 rounded-lg transition-all"
                              />
                            ) : (
                              <div className="p-3 bg-gradient-to-r from-[#344F1F]/5 to-[#344F1F]/10 rounded-lg border border-[#344F1F]/20">
                                <p className="text-gray-800 font-medium">
                                  {profileData.details?.student_number || "N/A"}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="year_level"
                              className="text-sm font-semibold text-gray-700"
                            >
                              Year Level
                            </Label>
                            {isEditingProfile ? (
                              <Input
                                id="year_level"
                                type="number"
                                min="1"
                                max="6"
                                value={profileData.details?.year_level || ""}
                                onChange={(e) =>
                                  handleProfileChange(
                                    "year_level",
                                    e.target.value
                                  )
                                }
                                className="border-2 border-gray-200 focus:border-[#F4991A] focus:ring-2 focus:ring-[#F4991A]/20 rounded-lg transition-all"
                              />
                            ) : (
                              <div className="p-3 bg-gradient-to-r from-[#344F1F]/5 to-[#344F1F]/10 rounded-lg border border-[#344F1F]/20">
                                <p className="text-gray-800 font-medium">
                                  Year{" "}
                                  {profileData.details?.year_level || "N/A"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="program"
                            className="text-sm font-semibold text-gray-700"
                          >
                            Program
                          </Label>
                          {isEditingProfile ? (
                            <Input
                              id="program"
                              value={profileData.details?.program || ""}
                              onChange={(e) =>
                                handleProfileChange("program", e.target.value)
                              }
                              className="border-2 border-gray-200 focus:border-[#F4991A] focus:ring-2 focus:ring-[#F4991A]/20 rounded-lg transition-all"
                              placeholder="e.g., Bachelor of Science in Computer Science"
                            />
                          ) : (
                            <div className="p-3 bg-gradient-to-r from-[#344F1F]/5 to-[#344F1F]/10 rounded-lg border border-[#344F1F]/20">
                              <p className="text-gray-800 font-medium">
                                {profileData.details?.program || "N/A"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

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
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#344F1F] mb-2">
            Evaluate Your Instructors
          </h2>
          <p className="text-black/60">
            Provide feedback on your enrolled courses and instructors
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 bg-white border-[#344F1F]/20">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/40 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search by instructor name, department, or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-[#344F1F]/20 focus:ring-[#F4991A]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Courses List */}
        {filteredCourses.length === 0 ? (
          <Card className="bg-white border-[#344F1F]/20">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-[#344F1F]/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#344F1F] mb-2">
                No Courses Found
              </h3>
              <p className="text-black/60">
                {searchQuery
                  ? "No courses match your search criteria"
                  : "You are not enrolled in any courses yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="bg-white border-[#344F1F]/20 hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-[#344F1F] mb-1">
                        {course.instructor_name}
                      </CardTitle>
                      <p className="text-sm text-black/60">
                        {course.department}
                      </p>
                    </div>
                    {course.hasEvaluated && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Evaluated
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-black/70 mb-1">
                      <BookOpen className="h-4 w-4" />
                      <span className="font-medium">{course.code}</span>
                    </div>
                    <p className="text-sm text-black/80">{course.name}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-black/70">
                    <MapPin className="h-4 w-4" />
                    <span>{course.office_location}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#344F1F]/10">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-[#F4991A] text-[#F4991A]" />
                      <span className="text-sm font-semibold text-[#344F1F]">
                        {course.rating > 0 ? course.rating.toFixed(1) : "N/A"}
                      </span>
                      <span className="text-xs text-black/60">
                        ({course.totalEvaluations} reviews)
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleEvaluateClick(course)}
                    disabled={course.hasEvaluated}
                    className={
                      course.hasEvaluated
                        ? "w-full bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "w-full bg-[#344F1F] hover:bg-[#344F1F]/90 text-[#F2EAD3]"
                    }
                  >
                    {course.hasEvaluated
                      ? "Already Evaluated"
                      : "Evaluate Instructor"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
