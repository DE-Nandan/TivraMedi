<template>
  <div id="landing-page">
    <div class="content">
      <h1 class="title">Welcome to TivraMedi</h1>

      <!-- Existing Explore Button -->
      <button class="explore-btn" @click="goToMap">Nearby Docters</button>

      <!-- New Symptom Triage Button -->
      <button class="triage-btn" @click="goToSymptomCheck">
        <span>🩺 Symptom Check</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goToMap() {
  router.push('/map') // Your existing map route
}

function goToSymptomCheck() {
  router.push('/symptom-check') // New symptom check route
}
</script>

<style src="@/assets/css/LandingPage.css"></style>
