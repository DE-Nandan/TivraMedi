// src/services/triageService.ts
import axios, { type AxiosInstance } from 'axios'

// Create separate client for triage service with extended timeout for AI processing
const triageClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_TRIAGE_BASE || 'http://localhost:8000',
  timeout: 180000, // 3 minutes (180 seconds)
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Type definitions
export interface TriageRequest {
  text: string
  patient_age: number
}

export interface TriageResponse {
  urgency: 'urgent' | 'moderate' | 'routine' | 'unknown' | 'error'
  message: string
}

export const assessSymptoms = async (
  symptoms: string,
  age: number = 30,
): Promise<TriageResponse> => {
  try {
    const requestData: TriageRequest = {
      text: symptoms,
      patient_age: age,
    }

    console.log('🤖 Starting AI symptom analysis...')
    const startTime = Date.now()

    const response = await triageClient.post<TriageResponse>('/triage', requestData)

    const duration = Date.now() - startTime
    console.log(`✅ AI analysis completed in ${duration}ms`)

    return response.data
  } catch (error) {
    console.error('Triage service error:', error)

    // FIXED: Enhanced error handling with proper null checking
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return {
          urgency: 'error',
          message: 'AI analysis is taking longer than expected. Please try again or contact support.',
        }
      } else if (error.response?.status === 499) {
        return {
          urgency: 'error',
          message: 'Request was canceled. Please try again.',
        }
      } else if (error.response && error.response.status >= 500) { // FIXED: Proper null checking
        return {
          urgency: 'error',
          message: 'AI medical service is temporarily unavailable. Please try again later.',
        }
      }
    }

    return {
      urgency: 'error',
      message: 'Medical triage service is currently unavailable',
    }
  }
}
