"use client"

import { useState } from "react"
import { ArrowLeft, Star, Send } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Textarea } from "./ui/textarea"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"

interface EvaluationFormProps {
  instructor: {
    id: string
    name: string
    department: string
    office: string
    courses: string[]
  }
  onClose: () => void
}

interface EvaluationData {
  // Teaching effectiveness
  teaching_clarity: number
  teaching_engagement: number
  teaching_knowledge: number
  teaching_organization: number
  teaching_feedback: number

  // Learning materials
  materials_quality: number
  materials_relevance: number
  materials_accessibility: number
  materials_variety: number
  materials_timeliness: number

  // Communication/Accessibility
  communication_availability: number
  communication_responsiveness: number
  communication_clarity: number
  communication_helpfulness: number
  communication_approachability: number

  // Comments
  teaching_comments: string
  materials_comments: string
  communication_comments: string
  general_comments: string
}

const teachingQuestions = [
  { key: "teaching_clarity", label: "Clarity of explanations and instructions" },
  { key: "teaching_engagement", label: "Ability to engage students in learning" },
  { key: "teaching_knowledge", label: "Knowledge of subject matter" },
  { key: "teaching_organization", label: "Organization of course content" },
  { key: "teaching_feedback", label: "Quality of feedback on assignments" },
]

const materialsQuestions = [
  { key: "materials_quality", label: "Quality of course materials" },
  { key: "materials_relevance", label: "Relevance of materials to course objectives" },
  { key: "materials_accessibility", label: "Accessibility of learning resources" },
  { key: "materials_variety", label: "Variety of learning materials provided" },
  { key: "materials_timeliness", label: "Timeliness of material distribution" },
]

const communicationQuestions = [
  { key: "communication_availability", label: "Availability during office hours" },
  { key: "communication_responsiveness", label: "Responsiveness to student inquiries" },
  { key: "communication_clarity", label: "Clarity of communication" },
  { key: "communication_helpfulness", label: "Helpfulness when students need assistance" },
  { key: "communication_approachability", label: "Approachability and openness to questions" },
]

export function EvaluationForm({ instructor, onClose }: EvaluationFormProps) {
  const [evaluationData, setEvaluationData] = useState<EvaluationData>({
    teaching_clarity: 0,
    teaching_engagement: 0,
    teaching_knowledge: 0,
    teaching_organization: 0,
    teaching_feedback: 0,
    materials_quality: 0,
    materials_relevance: 0,
    materials_accessibility: 0,
    materials_variety: 0,
    materials_timeliness: 0,
    communication_availability: 0,
    communication_responsiveness: 0,
    communication_clarity: 0,
    communication_helpfulness: 0,
    communication_approachability: 0,
    teaching_comments: "",
    materials_comments: "",
    communication_comments: "",
    general_comments: "",
  })

  const [currentSection, setCurrentSection] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const sections = ["Teaching Effectiveness", "Learning Materials", "Communication & Accessibility"]

  const handleRatingChange = (key: keyof EvaluationData, value: number) => {
    setEvaluationData((prev) => ({ ...prev, [key]: value }))
  }

  const handleCommentChange = (key: keyof EvaluationData, value: string) => {
    setEvaluationData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/submit-evaluation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instructor_id: instructor.id,
          instructor_name: instructor.name,
          ...evaluationData,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Evaluation submitted:", result)
        alert("Evaluation submitted successfully! Thank you for your feedback.")
        onClose()
      } else {
        throw new Error("Failed to submit evaluation")
      }
    } catch (error) {
      console.error("Error submitting evaluation:", error)
      alert("Failed to submit evaluation. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isCurrentSectionComplete = () => {
    if (currentSection === 0) {
      return teachingQuestions.every((q) => {
        const value = evaluationData[q.key as keyof EvaluationData]
        return typeof value === "number" && value > 0
      })
    } else if (currentSection === 1) {
      return materialsQuestions.every((q) => {
        const value = evaluationData[q.key as keyof EvaluationData]
        return typeof value === "number" && value > 0
      })
    } else {
      return communicationQuestions.every((q) => {
        const value = evaluationData[q.key as keyof EvaluationData]
        return typeof value === "number" && value > 0
      })
    }
  }

  const renderLikertScale = (questionKey: keyof EvaluationData, label: string) => (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <RadioGroup
        value={evaluationData[questionKey]?.toString() || ""}
        onValueChange={(value: string) => handleRatingChange(questionKey, Number.parseInt(value))}
        className="flex justify-between"
      >
        {[1, 2, 3, 4, 5].map((rating) => (
          <div key={rating} className="flex flex-col items-center space-y-2">
            <RadioGroupItem value={rating.toString()} id={`${questionKey}-${rating}`} />
            <Label
              htmlFor={`${questionKey}-${rating}`}
              className="text-xs text-center text-muted-foreground cursor-pointer"
            >
              {rating}
            </Label>
          </div>
        ))}
      </RadioGroup>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Strongly Disagree</span>
        <span>Strongly Agree</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">Evaluate Instructor</h1>
              <p className="text-muted-foreground">
                {instructor.name} - {instructor.department}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {sections.map((section, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentSection ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`ml-2 text-sm ${index <= currentSection ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {section}
                </span>
                {index < sections.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${index < currentSection ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              {sections[currentSection]}
            </CardTitle>
            <CardDescription>
              Rate each aspect on a scale of 1-5 where 1 is "Strongly Disagree" and 5 is "Strongly Agree"
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Teaching Effectiveness Section */}
            {currentSection === 0 && (
              <div className="space-y-6">
                {teachingQuestions.map((question) => (
                  <div key={question.key}>
                    {renderLikertScale(question.key as keyof EvaluationData, question.label)}
                  </div>
                ))}
                <div className="space-y-2">
                  <Label htmlFor="teaching-comments" className="text-sm font-medium">
                    Additional Comments (Optional)
                  </Label>
                  <Textarea
                    id="teaching-comments"
                    placeholder="Share your thoughts about the instructor's teaching effectiveness..."
                    value={evaluationData.teaching_comments}
                    onChange={(e) => handleCommentChange("teaching_comments", e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Learning Materials Section */}
            {currentSection === 1 && (
              <div className="space-y-6">
                {materialsQuestions.map((question) => (
                  <div key={question.key}>
                    {renderLikertScale(question.key as keyof EvaluationData, question.label)}
                  </div>
                ))}
                <div className="space-y-2">
                  <Label htmlFor="materials-comments" className="text-sm font-medium">
                    Additional Comments (Optional)
                  </Label>
                  <Textarea
                    id="materials-comments"
                    placeholder="Share your thoughts about the learning materials provided..."
                    value={evaluationData.materials_comments}
                    onChange={(e) => handleCommentChange("materials_comments", e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Communication Section */}
            {currentSection === 2 && (
              <div className="space-y-6">
                {communicationQuestions.map((question) => (
                  <div key={question.key}>
                    {renderLikertScale(question.key as keyof EvaluationData, question.label)}
                  </div>
                ))}
                <div className="space-y-2">
                  <Label htmlFor="communication-comments" className="text-sm font-medium">
                    Additional Comments (Optional)
                  </Label>
                  <Textarea
                    id="communication-comments"
                    placeholder="Share your thoughts about the instructor's communication and accessibility..."
                    value={evaluationData.communication_comments}
                    onChange={(e) => handleCommentChange("communication_comments", e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="general-comments" className="text-sm font-medium">
                    General Comments (Optional)
                  </Label>
                  <Textarea
                    id="general-comments"
                    placeholder="Any additional feedback about this instructor..."
                    value={evaluationData.general_comments}
                    onChange={(e) => handleCommentChange("general_comments", e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                disabled={currentSection === 0}
              >
                Previous
              </Button>

              {currentSection < sections.length - 1 ? (
                <Button
                  onClick={() => setCurrentSection(currentSection + 1)}
                  disabled={!isCurrentSectionComplete()}
                  className="bg-primary hover:bg-primary/90"
                >
                  Next Section
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isCurrentSectionComplete() || isSubmitting}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Submitting..." : "Submit Evaluation"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}