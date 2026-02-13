import { z } from 'zod';
import { API_URL, MOCK_RESULTS_FALLBACK } from '../constants';
import { ApiResponse } from '../types';

const ApiResponseSchema = z.object({
  msg: z.string(),
  results: z.array(
    z.object({
      start: z.number(),
      end: z.number(),
      scientificName: z.string(),
      commonName: z.string(),
      confidence: z.number()
    })
  )
});

export interface AnalysisError {
  type: 'network' | 'server' | 'client';
  message: string;
  originalError?: unknown;
}

export const analyzeAudio = async (file: File): Promise<ApiResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
    }

    const rawData = await response.json();

    const data = ApiResponseSchema.parse(rawData);
    return data;

  } catch (error) {
    let errorType: AnalysisError['type'] = 'client';
    let errorMessage = 'Unknown error occurred';

    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorType = 'network';
      errorMessage = 'Unable to connect to the analysis server. Please check your network connection and ensure the backend is running.';
    } else if (error instanceof Error) {
      if (error.message.includes('API Error')) {
        errorType = 'server';
        errorMessage = `Server error: ${error.message}`;
      } else {
        errorMessage = error.message;
      }
    }

    const analysisError: AnalysisError = {
      type: errorType,
      message: errorMessage,
      originalError: error
    };

    console.warn(`API call failed (${errorType}):`, errorMessage, error);

    const USE_MOCK_FALLBACK = import.meta.env.DEV || false;

    if (USE_MOCK_FALLBACK) {
      console.warn("Using fallback mock data for demonstration purposes only.");
      await new Promise(resolve => setTimeout(resolve, 2000));
      return MOCK_RESULTS_FALLBACK as ApiResponse;
    }

    throw new Error(errorMessage);
  }
};
