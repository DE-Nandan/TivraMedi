// src/services/mapService.ts
import apiClient from './api'
import type { Doctor, BookingResult } from '@/assets/utils/useDoctorsMap'

// Additional interfaces for this service
export interface BookAppointmentRequest {
  doctor_id: number
  time_slot: string
}

export interface ApiError extends Error {
  response?: {
    status: number
    data: any
  }
}

export const fetchDoctors = async (): Promise<Doctor[]> => {
  try {
    const response = await apiClient.get<Doctor[]>('/doctors')
    return response.data
  } catch (error) {
    console.error('Failed to fetch doctors:', error)
    throw error as ApiError
  }
}

export const fetchDoctorDetails = async (doctorId: number): Promise<Doctor> => {
  try {
    const response = await apiClient.get<Doctor>(`/doctors/${doctorId}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch doctor details:', error)
    throw error as ApiError
  }
}

export const bookAppointment = async (
  doctorId: number,
  timeSlot: string,
): Promise<BookingResult> => {
  try {
    const bookingData: BookAppointmentRequest = {
      doctor_id: doctorId,
      time_slot: timeSlot,
    }

    const response = await apiClient.post<BookingResult>('/book', bookingData)
    return response.data
  } catch (error) {
    console.error('Booking failed:', error)
    throw error as ApiError
  }
}
