"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Star, Users, Shield, ArrowRight, GraduationCap } from "lucide-react";
import { LoginModal } from "../components/login-modal";

export default function InstructorEvaluationLanding() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Check for showLogin parameter and automatically open login modal
  useEffect(() => {
    if (searchParams.get("showLogin") === "true") {
      setIsLoginModalOpen(true);
      // Remove the parameter from URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="min-h-screen bg-[#F9F5F0]">
      {/* Header */}
      <header className="bg-[#F2EAD3] border-b border-[#344F1F]/10 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#344F1F] flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-[#F4991A]" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-black">
                Evaluation Portal
              </span>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-[#4CAF50] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#45a049] transition-colors text-sm sm:text-base flex items-center gap-2"
              >
                Sign In
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#F2EAD3] via-[#F9F5F0] to-[#F2EAD3] min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center w-full space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#F4991A]/10 text-[#F4991A] px-4 py-2 rounded-full text-sm font-semibold">
                <Star className="w-4 h-4" />
                <span className="hidden sm:inline">AI-Powered</span> Feedback
                System
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-black leading-tight">
                Transform Education with
                <span className="text-[#F4991A] block mt-2">
                  Smart Evaluations
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-black/80 leading-relaxed px-4">
                Empower students and instructors with intelligent feedback
                systems that drive meaningful improvements in teaching and
                learning outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 bg-[#F2EAD3]">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black text-balance">
              Everything you need for effective evaluations
            </h2>
            <p className="text-lg sm:text-xl text-black/70 text-pretty">
              Our comprehensive platform provides tools for both students and
              instructors to create meaningful feedback loops.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-[#344F1F]/10 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-[#F4991A]/10 flex items-center justify-center mb-6">
                <Star className="w-6 h-6 text-[#F4991A]" />
              </div>
              <h3 className="text-xl font-semibold text-[#344F1F] mb-3">
                AI-Powered Insights
              </h3>
              <p className="text-black/70 leading-relaxed">
                Get intelligent analysis of feedback patterns and actionable
                recommendations for improvement.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-[#344F1F]/10 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-[#344F1F]/10 flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-[#344F1F]" />
              </div>
              <h3 className="text-xl font-semibold text-[#344F1F] mb-3">
                Student-Centered Design
              </h3>
              <p className="text-black/70 leading-relaxed">
                Intuitive interface that encourages honest, constructive
                feedback from students.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-[#344F1F]/10 hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 rounded-lg bg-[#F4991A]/10 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-[#F4991A]" />
              </div>
              <h3 className="text-xl font-semibold text-[#344F1F] mb-3">
                Privacy & Security
              </h3>
              <p className="text-black/70 leading-relaxed">
                Anonymous feedback options with enterprise-grade security to
                protect all users.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 flex flex-col items-center text-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#344F1F] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[#F4991A]" />
              </div>
              <span className="font-bold text-[#F2EAD3]">
                Evaluation Portal
              </span>
            </div>
            <p className="text-white/60 text-sm max-w-md">
              Transforming education through intelligent feedback systems.
            </p>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-white/60">
            <p>
              &copy; {new Date().getFullYear()} Evaluation Portal. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
