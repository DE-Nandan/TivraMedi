<template>
  <div class="medical-app">
    <div class="app-header">
      <div class="logo">
        <div class="logo-icon">
          <i class="fas fa-heartbeat"></i>
        </div>
        <div>
          <h1>MediScan Triage</h1>
          <div class="subtitle">
            AI-powered symptom analysis for accurate medical urgency assessment
          </div>
        </div>
      </div>
    </div>

    <div class="app-content">
      <div class="symptom-checker">
        <div class="form-container">
          <div class="input-group">
            <label for="symptoms"
              ><i class="fas fa-notes-medical"></i> Describe Your Symptoms</label
            >
            <textarea
              v-model="symptomsText"
              id="symptoms"
              placeholder="Please describe your symptoms in detail, including duration and severity..."
              rows="6"
            ></textarea>
          </div>

          <div class="button-container">
            <button @click="checkUrgency" :disabled="loading">
              <i :class="loading ? 'fas fa-spinner fa-spin' : 'fas fa-stethoscope'"></i>
              {{ loading ? 'Analyzing Symptoms...' : 'Assess Urgency Level' }}
            </button>
          </div>

          <div class="result-container" v-if="result || error">
            <div v-if="result" :class="['result', resultClass]">
              <div class="result-header">
                <div class="result-icon">
                  <i v-if="result.urgency === 'urgent'" class="fas fa-exclamation-triangle"></i>
                  <i v-if="result.urgency === 'moderate'" class="fas fa-clock"></i>
                  <i v-if="result.urgency === 'routine'" class="fas fa-calendar-check"></i>
                  <i
                    v-if="result.urgency === 'unknown' || result.urgency === 'error'"
                    class="fas fa-question-circle"
                  ></i>
                </div>
                <div>{{ resultHeader }}</div>
              </div>
              <p>{{ result.message }}</p>

              <div v-if="result.urgency === 'urgent'" class="recommendation">
                <i class="fas fa-ambulance"></i>
                <div>
                  🚨 Recommendation: Seek immediate medical attention at your nearest emergency
                  department
                </div>
              </div>
              <div v-if="result.urgency === 'moderate'" class="recommendation">
                <i class="fas fa-user-md"></i>
                <div>🕒 Recommendation: Schedule a doctor visit within the next 24 hours</div>
              </div>
              <div v-if="result.urgency === 'routine'" class="recommendation">
                <i class="fas fa-calendar-alt"></i>
                <div>
                  📅 Recommendation: Schedule a routine appointment with your primary care provider
                </div>
              </div>
            </div>

            <div v-if="error" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              <div>{{ error }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="info-panel">
        <h2 class="info-title">Triage Guidance</h2>

        <div class="info-item">
          <h3><i class="fas fa-bolt"></i> Urgent Symptoms</h3>
          <p>
            Chest pain, difficulty breathing, severe bleeding, stroke symptoms, loss of
            consciousness, or severe trauma. Requires immediate emergency care.
          </p>
        </div>

        <div class="info-item">
          <h3><i class="fas fa-clock"></i> Moderate Symptoms</h3>
          <p>
            High fever, severe pain, persistent vomiting, infections, or significant injuries.
            Should be evaluated within 24 hours.
          </p>
        </div>

        <div class="info-item">
          <h3><i class="fas fa-calendar"></i> Routine Symptoms</h3>
          <p>
            Cold symptoms, minor injuries, rashes, or ongoing health management. Can wait for a
            scheduled appointment.
          </p>
        </div>

        <div class="info-item">
          <h3><i class="fas fa-shield-alt"></i> Privacy & Security</h3>
          <p>
            All data is encrypted and HIPAA compliant. Your information is never stored or shared.
          </p>
        </div>
      </div>
    </div>

    <footer class="app-footer">
      <div class="security-badge">
        <i class="fas fa-lock"></i>
        <div>HIPAA Compliant • End-to-End Encryption</div>
      </div>
      <div class="copyright">
        &copy; 2023 MediScan Health Technologies. For medical advice, consult a healthcare
        professional.
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { assessSymptoms } from '@/services/triageService'

const symptomsText = ref('')
const result = ref(null)
const loading = ref(false)
const error = ref('')

const resultClass = computed(() => {
  if (!result.value) return ''
  return result.value.urgency
})

const resultHeader = computed(() => {
  const headers = {
    urgent: 'URGENT CARE REQUIRED',
    moderate: 'MEDICAL ATTENTION NEEDED WITHIN 24 HOURS',
    routine: 'SCHEDULE ROUTINE APPOINTMENT',
    unknown: 'SYMPTOM ANALYSIS INCONCLUSIVE',
    error: 'SERVICE TEMPORARILY UNAVAILABLE',
  }
  return headers[result.value?.urgency] || 'Symptom Analysis'
})

async function checkUrgency() {
  if (!symptomsText.value.trim()) {
    error.value = 'Please describe your symptoms to get an assessment'
    return
  }

  try {
    loading.value = true
    error.value = ''
    result.value = null

    // Use centralized service
    result.value = await assessSymptoms(symptomsText.value)

    // Handle unknown response
    if (result.value.urgency === 'unknown') {
      error.value =
        'Could not determine urgency. Please provide more specific details about your symptoms.'
    }
  } catch (err) {
    console.error('Triage error:', err)
    error.value = 'Service is temporarily unavailable. Please try again later.'
    result.value = {
      urgency: 'error',
      message:
        'Medical triage service is currently unavailable. Please contact your healthcare provider directly.',
    }
  } finally {
    loading.value = false
  }
}
</script>

<style src="@/assets/css/SymptomCheck.css"></style>
