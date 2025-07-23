<template>
  <div id="landing-page" class="medical-landing">
    <div class="app-header">
      <div class="logo">
        <div class="logo-icon">
          <i class="fas fa-heartbeat"></i>
        </div>
        <div>
          <h1>MediScan Health</h1>
          <div class="subtitle">Advanced medical technology at your fingertips</div>
        </div>
      </div>
    </div>

    <div class="hero-section">
      <div class="hero-content">
        <h2 class="hero-title">Your Health, Our Priority</h2>
        <p class="hero-subtitle">
          Access medical services instantly with our advanced healthcare platform
        </p>

        <div class="cta-container">
          <button class="cta-btn explore-btn" @click="goToMap">
            <i class="fas fa-map-marker-alt"></i>
            <span>Find Nearby Doctors</span>
          </button>

          <button class="cta-btn triage-btn" @click="goToSymptomCheck">
            <i class="fas fa-stethoscope"></i>
            <span>Symptom Triage Assistant</span>
          </button>
        </div>
      </div>

      <div class="hero-image">
        <div class="image-placeholder">
          <i class="fas fa-user-md"></i>
          <div>Advanced Medical Technology</div>
        </div>
      </div>
    </div>

    <div class="features-section">
      <h3 class="section-title">Our Services</h3>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-search-location"></i>
          </div>
          <h4>Doctor Locator</h4>
          <p>Find nearby healthcare professionals based on specialty and availability</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-laptop-medical"></i>
          </div>
          <h4>Symptom Analysis</h4>
          <p>AI-powered symptom assessment with urgency classification</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-calendar-check"></i>
          </div>
          <h4>Appointment Booking</h4>
          <p>Schedule in-person or virtual consultations with ease</p>
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

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goToMap() {
  router.push('/map')
}

function goToSymptomCheck() {
  router.push('/symptom-check')
}
</script>

<style src="@/assets/css/LandingPage.css"></style>
