import { API_URL, MOCK_RESULTS_FALLBACK } from '../constants';
import { ApiResponse } from '../types';

export const analyzeAudio = async (file: File): Promise<ApiResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data as ApiResponse;

  } catch (error) {
    console.warn("API call failed or server unreachable. Using fallback mock data for demonstration.", error);
    
    // Simulate network delay for the mock fallback
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return MOCK_RESULTS_FALLBACK as ApiResponse;
  }
};
