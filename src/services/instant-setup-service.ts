import { supabase } from '../supabase-client';

/**
 * Submit an instant setup request
 * @param email - The user's email address
 * @returns Success status and any error message
 */
export async function submitInstantSetupRequest(email: string) {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: 'Please enter a valid email address',
      };
    }

    // Insert the request
    const { data, error } = await supabase
      .from('instant_setup_requests')
      .insert([
        {
          email: email.toLowerCase().trim(),
          request_type: 'instant_setup',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error submitting instant setup request:', error);
      return {
        success: false,
        error: 'Failed to submit request. Please try again.',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Exception in submitInstantSetupRequest:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

/**
 * Get all instant setup requests (admin only)
 * @returns List of all requests
 */
export async function getAllInstantSetupRequests() {
  try {
    const { data, error } = await supabase
      .from('instant_setup_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching instant setup requests:', error);
      return {
        success: false,
        error: 'Failed to fetch requests',
        data: [],
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error('Exception in getAllInstantSetupRequests:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
      data: [],
    };
  }
}
