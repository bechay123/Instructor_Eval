import { supabase } from '../supabase-client';

export interface ActivityLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  activity_type: string;
  activity_description: string;
  metadata: Record<string, any> | null;
  performed_by_id: string | null;
  performed_by_email: string | null;
  performed_by_role: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export type ActivityType = 
  | 'user_registered'
  | 'user_approved'
  | 'user_suspended'
  | 'user_reactivated'
  | 'user_deleted'
  | 'instant_setup_request'
  | 'course_created'
  | 'course_updated'
  | 'course_deleted'
  | 'evaluation_submitted'
  | 'student_enrolled'
  | 'instructor_added_student'
  | 'ai_analysis_requested'
  | 'profile_updated'
  | 'admin_login'
  | 'admin_action';

/**
 * Fetch all activity logs with optional filtering
 */
export async function getAllActivityLogs(
  filters?: {
    activityType?: ActivityType;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }
): Promise<{ data: ActivityLog[] | null; error: any }> {
  try {
    let query = supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters if provided
    if (filters?.activityType) {
      query = query.eq('activity_type', filters.activityType);
    }

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    } else {
      query = query.limit(100); // Default limit
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching activity logs:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getAllActivityLogs:', error);
    return { data: null, error };
  }
}

/**
 * Log a manual activity (for activities not automatically logged by triggers)
 */
export async function logActivity(
  activityType: ActivityType,
  activityDescription: string,
  metadata?: Record<string, any>,
  userId?: string,
  userEmail?: string,
  userRole?: string,
  performedById?: string,
  performedByEmail?: string,
  performedByRole?: string
): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId || null,
        user_email: userEmail || null,
        user_role: userRole || null,
        activity_type: activityType,
        activity_description: activityDescription,
        metadata: metadata || null,
        performed_by_id: performedById || null,
        performed_by_email: performedByEmail || null,
        performed_by_role: performedByRole || null
      });

    if (error) {
      console.error('Error logging activity:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in logActivity:', error);
    return { success: false, error };
  }
}

/**
 * Get activity log statistics
 */
export async function getActivityLogStats(): Promise<{
  data: {
    totalActivities: number;
    todayActivities: number;
    userRegistrations: number;
    instantSetupRequests: number;
    userApprovals: number;
    userSuspensions: number;
  } | null;
  error: any;
}> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all activity logs and calculate stats in memory
    const { data: allLogs, error: logsError } = await supabase
      .from('activity_logs')
      .select('activity_type, created_at')
      .order('created_at', { ascending: false });

    if (logsError) {
      console.error('Error fetching activity logs for stats:', logsError);
      return { data: null, error: logsError };
    }

    if (!allLogs) {
      return {
        data: {
          totalActivities: 0,
          todayActivities: 0,
          userRegistrations: 0,
          instantSetupRequests: 0,
          userApprovals: 0,
          userSuspensions: 0
        },
        error: null
      };
    }

    // Calculate stats from the fetched data
    const totalActivities = allLogs.length;
    const todayActivities = allLogs.filter(log => 
      new Date(log.created_at) >= today
    ).length;
    const userRegistrations = allLogs.filter(log => 
      log.activity_type === 'user_registered'
    ).length;
    const instantSetupRequests = allLogs.filter(log => 
      log.activity_type === 'instant_setup_request'
    ).length;
    const userApprovals = allLogs.filter(log => 
      log.activity_type === 'user_approved'
    ).length;
    const userSuspensions = allLogs.filter(log => 
      log.activity_type === 'user_suspended'
    ).length;

    return {
      data: {
        totalActivities,
        todayActivities,
        userRegistrations,
        instantSetupRequests,
        userApprovals,
        userSuspensions
      },
      error: null
    };
  } catch (error) {
    console.error('Error in getActivityLogStats:', error);
    return { data: null, error };
  }
}

/**
 * Get recent activity logs (last 10 by default)
 */
export async function getRecentActivityLogs(limit: number = 10): Promise<{
  data: ActivityLog[] | null;
  error: any;
}> {
  return getAllActivityLogs({ limit });
}

/**
 * Log AI analysis request (to be called from instructor dashboard)
 */
export async function logAIAnalysisRequest(
  instructorId: string,
  courseId: string,
  analysisType: string = 'general'
): Promise<{ success: boolean; error: any }> {
  try {
    // Insert into ai_analysis_requests table (trigger will log to activity_logs)
    const { error } = await supabase
      .from('ai_analysis_requests')
      .insert({
        instructor_id: instructorId,
        course_id: courseId,
        analysis_type: analysisType
      });

    if (error) {
      console.error('Error logging AI analysis request:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in logAIAnalysisRequest:', error);
    return { success: false, error };
  }
}
