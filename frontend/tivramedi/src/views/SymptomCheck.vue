<template>
  <div class="symptom-checker">
    <h1>Symptom Triage Assistant</h1>
    <div class="form-container">
      <textarea v-model="symptomsText" placeholder="Describe your symptoms..." rows="6"></textarea>

      <button @click="checkUrgency" :disabled="loading">
        {{ loading ? 'Analyzing...' : 'Check Urgency Level' }}
      </button>

      <div v-if="result" :class="['result', resultClass]">
        <h3>{{ resultHeader }}</h3>
        <p>{{ result.message }}</p>
        <p v-if="result.urgency === 'urgent'" class="recommendation">
          🚨 Recommendation: Seek immediate medical attention
        </p>
      </div>

      <div v-if="error" class="error-message">❌ {{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'

const symptomsText = ref('')
const result = ref(null)
const loading = ref(false)
const error = ref('')

const resultClass = computed(() => {
  if (!result.value) return ''
  return result.value.urgency === 'urgent' ? 'urgent' : 'non-urgent'
})

const resultHeader = computed(() => {
  const headers = {
    urgent: 'Urgent Care Needed',
    moderate: 'Seek Care Within 24 Hours',
    routine: 'Schedule Routine Appointment',
    unknown: 'Symptom Analysis',
    error: 'Service Error',
  }
  return headers[result.value?.urgency] || 'Symptom Analysis'
})

async function checkUrgency() {
  if (!symptomsText.value.trim()) {
    error.value = 'Please describe your symptoms'
    return
  }

  try {
    loading.value = true
    error.value = ''
    result.value = null

    const response = await axios.post('http://localhost:8080/triage', {
      text: symptomsText.value,
    })

    result.value = response.data

    // Handle unknown response
    if (result.value.urgency === 'unknown') {
      error.value = 'Could not determine urgency. Please provide more details.'
    }
  } catch (err) {
    console.error('Triage error:', err)
    error.value =
      err.response?.data?.error || err.message || 'Service unavailable. Please try again later.'
  } finally {
    loading.value = false
  }
}
</script>

<style src="@/assets/css/SymptomCheck.css"></style>
