import apiClient from './api'

export const fetchDoctors = async () => {
  try {
    const response = await apiClient.get('/doctors')
    return response.data
  } catch (error) {
    console.error('Failed to fetch doctors:', error)
    throw error
  }
}

export const fetchDoctorDetails = async (doctorId) => {
  try {
    const response = await apiClient.get(`/doctors/${doctorId}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch doctor details:', error)
    throw error
  }
}

export const bookAppointment = async (doctorId, timeSlot) => {
  try {
    const response = await apiClient.post('/book', {
      doctor_id: doctorId,
      time_slot: timeSlot,
    })
    return response.data
  } catch (error) {
    console.error('Booking failed:', error)
    throw error
  }
}
