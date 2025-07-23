// src/services/triageService.ts
import axios, { type AxiosInstance } from 'axios'

// Create separate client for triage service with localhost default
const triageClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_TRIAGE_BASE || 'http://localhost:8000',
  timeout: 10000,
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

    const response = await triageClient.post<TriageResponse>('/triage', requestData)
    return response.data
  } catch (error) {
    console.error('Triage service error:', error)
    return {
      urgency: 'error',
      message: 'Medical triage service is currently unavailable',
    }
  }
}
