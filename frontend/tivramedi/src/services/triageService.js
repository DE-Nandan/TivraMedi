import apiClient from './api'

export const assessSymptoms = async (symptoms, age = 30) => {
  try {
    const response = await apiClient.post('/triage', {
      text: symptoms,
      patient_age: age,
    })
    return response.data
  } catch (error) {
    console.error('Triage service error:', error)
    return {
      urgency: 'error',
      message: 'Medical triage service is currently unavailable',
    }
  }
}
