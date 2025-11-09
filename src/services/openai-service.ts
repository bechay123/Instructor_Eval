import OpenAI from 'openai';
import { supabase } from '@/supabase-client';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: For production, move this to a backend API
});

export interface AIAnalysisInput {
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

export interface AIAnalysisResult {
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  sentimentAnalysis: {
    overall: 'positive' | 'neutral' | 'negative';
    teaching: 'positive' | 'neutral' | 'negative';
    materials: 'positive' | 'neutral' | 'negative';
    communication: 'positive' | 'neutral' | 'negative';
  };
  keyThemes: string[];
}

export async function generateAIAnalysis(data: AIAnalysisInput): Promise<AIAnalysisResult> {
  try {
    // Prepare the data summary for the AI
    const dataSummary = `
      Course Evaluation Summary:
      - Total Evaluations: ${data.totalEvaluations}
      - Overall Rating: ${data.overallRating.toFixed(2)}/5.0
      - Response Rate: ${data.responseRate.toFixed(1)}%
      
      Category Averages:
      - Teaching Effectiveness: ${data.categoryAverages.teaching.toFixed(2)}/5.0
      - Learning Materials: ${data.categoryAverages.materials.toFixed(2)}/5.0
      - Communication & Accessibility: ${data.categoryAverages.communication.toFixed(2)}/5.0
      
      Detailed Ratings:
      Teaching:
      - Clarity: ${calculateAverage(data.detailedRatings.teaching_clarity)}/5.0
      - Engagement: ${calculateAverage(data.detailedRatings.teaching_engagement)}/5.0
      - Knowledge: ${calculateAverage(data.detailedRatings.teaching_knowledge)}/5.0
      - Organization: ${calculateAverage(data.detailedRatings.teaching_organization)}/5.0
      - Feedback: ${calculateAverage(data.detailedRatings.teaching_feedback)}/5.0
      
      Materials:
      - Quality: ${calculateAverage(data.detailedRatings.materials_quality)}/5.0
      - Relevance: ${calculateAverage(data.detailedRatings.materials_relevance)}/5.0
      - Accessibility: ${calculateAverage(data.detailedRatings.materials_accessibility)}/5.0
      - Variety: ${calculateAverage(data.detailedRatings.materials_variety)}/5.0
      - Timeliness: ${calculateAverage(data.detailedRatings.materials_timeliness)}/5.0
      
      Communication:
      - Availability: ${calculateAverage(data.detailedRatings.communication_availability)}/5.0
      - Responsiveness: ${calculateAverage(data.detailedRatings.communication_responsiveness)}/5.0
      - Clarity: ${calculateAverage(data.detailedRatings.communication_clarity)}/5.0
      - Helpfulness: ${calculateAverage(data.detailedRatings.communication_helpfulness)}/5.0
      - Approachability: ${calculateAverage(data.detailedRatings.communication_approachability)}/5.0
      
      Student Comments:
      ${data.comments.map((comment, index) => `
        Comment ${index + 1}:
        ${comment.teaching_comments ? `Teaching: ${comment.teaching_comments}` : ''}
        ${comment.materials_comments ? `Materials: ${comment.materials_comments}` : ''}
        ${comment.communication_comments ? `Communication: ${comment.communication_comments}` : ''}
        ${comment.general_comments ? `General: ${comment.general_comments}` : ''}
      `).join('\n')}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an educational evaluation expert analyzing instructor performance based on student feedback. 
          Provide constructive, actionable insights that help instructors improve their teaching. 
          Be balanced, highlighting both strengths and areas for improvement.
          Format your response as JSON with the following structure:
          {
            "summary": "A brief 2-3 sentence overview of the instructor's performance",
            "strengths": ["strength 1", "strength 2", "strength 3"],
            "areasForImprovement": ["area 1", "area 2", "area 3"],
            "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
            "sentimentAnalysis": {
              "overall": "positive|neutral|negative",
              "teaching": "positive|neutral|negative",
              "materials": "positive|neutral|negative",
              "communication": "positive|neutral|negative"
            },
            "keyThemes": ["theme 1", "theme 2", "theme 3"]
          }`
        },
        {
          role: "user",
          content: `Please analyze the following instructor evaluation data and provide insights:\n\n${dataSummary}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0].message.content || '{}';
    
    // Remove markdown code blocks if present (e.g., ```json ... ```)
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```')) {
      // Remove opening ```json or ``` and closing ```
      cleanedResponse = cleanedResponse
        .replace(/^```(?:json)?\n?/, '')
        .replace(/\n?```$/, '')
        .trim();
    }
    
    // Parse the JSON response
    const analysisResult: AIAnalysisResult = JSON.parse(cleanedResponse);
    
    return analysisResult;
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    throw new Error('Failed to generate AI analysis. Please check your API key and try again.');
  }
}

function calculateAverage(ratings: number[]): string {
  if (ratings.length === 0) return '0.00';
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  return avg.toFixed(2);
}

// Database functions for AI reports

export interface AIReport {
  id: string;
  course_id: string;
  instructor_id: string;
  generated_at: string;
  evaluation_count: number;
  overall_rating: number;
  response_rate: number;
  summary: string;
  strengths: string[];
  areas_for_improvement: string[];
  recommendations: string[];
  key_themes: string[];
  sentiment_overall: 'positive' | 'neutral' | 'negative';
  sentiment_teaching: 'positive' | 'neutral' | 'negative';
  sentiment_materials: 'positive' | 'neutral' | 'negative';
  sentiment_communication: 'positive' | 'neutral' | 'negative';
  category_avg_teaching: number;
  category_avg_materials: number;
  category_avg_communication: number;
  model_used: string;
  tokens_used?: number;
}

export async function saveAIReport(
  courseId: string,
  instructorId: string,
  analysisInput: AIAnalysisInput,
  analysisResult: AIAnalysisResult,
  tokensUsed?: number
): Promise<AIReport | null> {
  try {
    const { data, error } = await supabase
      .from('ai_analysis_reports')
      .insert({
        course_id: courseId,
        instructor_id: instructorId,
        evaluation_count: analysisInput.totalEvaluations,
        overall_rating: analysisInput.overallRating,
        response_rate: analysisInput.responseRate,
        summary: analysisResult.summary,
        strengths: analysisResult.strengths,
        areas_for_improvement: analysisResult.areasForImprovement,
        recommendations: analysisResult.recommendations,
        key_themes: analysisResult.keyThemes,
        sentiment_overall: analysisResult.sentimentAnalysis.overall,
        sentiment_teaching: analysisResult.sentimentAnalysis.teaching,
        sentiment_materials: analysisResult.sentimentAnalysis.materials,
        sentiment_communication: analysisResult.sentimentAnalysis.communication,
        category_avg_teaching: analysisInput.categoryAverages.teaching,
        category_avg_materials: analysisInput.categoryAverages.materials,
        category_avg_communication: analysisInput.categoryAverages.communication,
        model_used: 'gpt-4o-mini',
        tokens_used: tokensUsed,
        evaluation_data_snapshot: analysisInput, // Store full snapshot for reference
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving AI report:', error);
    return null;
  }
}

export async function getAIReportsForCourse(courseId: string): Promise<AIReport[]> {
  try {
    const { data, error } = await supabase
      .from('ai_analysis_reports')
      .select('*')
      .eq('course_id', courseId)
      .eq('is_active', true)
      .order('generated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching AI reports:', error);
    return [];
  }
}

export async function getLatestAIReport(courseId: string): Promise<AIReport | null> {
  try {
    const { data, error } = await supabase
      .from('ai_analysis_reports')
      .select('*')
      .eq('course_id', courseId)
      .eq('is_active', true)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error fetching latest AI report:', error);
    return null;
  }
}

export async function deleteAIReport(reportId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('ai_analysis_reports')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', reportId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting AI report:', error);
    return false;
  }
}
