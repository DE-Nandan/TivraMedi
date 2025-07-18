<template>
  <div class="medical-app">
    <div class="app-header">
      <div class="logo">
        <div class="logo-icon">
          <i class="fas fa-heartbeat"></i>
        </div>
        <div>
          <h1>MediScan Health</h1>
          <div class="subtitle">Find healthcare professionals near you</div>
        </div>
      </div>
    </div>

    <div class="app-content">
      <div class="map-page">
        <div class="map-header">
          <h1 class="title">
            <i class="fas fa-map-marker-alt"></i>
            Doctors Near You
          </h1>

          <div class="map-controls">
            <div class="search-container">
              <input
                type="text"
                placeholder="Search by specialty or name..."
                class="search-input"
              />
              <button class="search-btn">
                <i class="fas fa-search"></i>
              </button>
            </div>

            <div class="filter-container">
              <button class="filter-btn">
                <i class="fas fa-filter"></i>
                Filters
              </button>
            </div>
          </div>
        </div>

        <div class="map-info-bar">
          <div class="info-item">
            <i class="fas fa-user-md"></i>
            <span>24 doctors available in your area</span>
          </div>
          <div class="info-item">
            <i class="fas fa-clock"></i>
            <span>3 doctors available now</span>
          </div>
        </div>

        <div class="map-container">
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner">
              <i class="fas fa-spinner fa-spin"></i>
            </div>
            <p>Loading healthcare providers in your area...</p>
          </div>

          <div v-if="error" class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <p>{{ error }}</p>
            <button class="retry-btn">Retry</button>
          </div>

          <div id="map" v-else></div>

          <div class="realtime-notification">
            <i class="fas fa-bell"></i>
            <span>Real-time availability updates enabled</span>
          </div>
        </div>

        <div class="doctor-list">
          <h2 class="section-title">Available Healthcare Providers</h2>

          <div class="doctor-cards">
            <div class="doctor-card">
              <div class="doctor-avatar">
                <i class="fas fa-user-md"></i>
              </div>
              <div class="doctor-info">
                <h3>Dr. Sarah Johnson</h3>
                <div class="specialty">Cardiologist</div>
                <div class="rating">
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star-half-alt"></i>
                  <span>4.7 (124 reviews)</span>
                </div>
                <div class="availability available">
                  <i class="fas fa-check-circle"></i>
                  Available now
                </div>
              </div>
              <div class="doctor-actions">
                <button class="action-btn view-profile">
                  <i class="fas fa-user"></i>
                  Profile
                </button>
                <button class="action-btn book-appointment">
                  <i class="fas fa-calendar-check"></i>
                  Book
                </button>
              </div>
            </div>

            <div class="doctor-card">
              <div class="doctor-avatar">
                <i class="fas fa-user-md"></i>
              </div>
              <div class="doctor-info">
                <h3>Dr. Michael Chen</h3>
                <div class="specialty">General Practitioner</div>
                <div class="rating">
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <span>4.9 (98 reviews)</span>
                </div>
                <div class="availability available">
                  <i class="fas fa-check-circle"></i>
                  Available now
                </div>
              </div>
              <div class="doctor-actions">
                <button class="action-btn view-profile">
                  <i class="fas fa-user"></i>
                  Profile
                </button>
                <button class="action-btn book-appointment">
                  <i class="fas fa-calendar-check"></i>
                  Book
                </button>
              </div>
            </div>
          </div>
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
import { onMounted } from 'vue'
import useDoctorsMap from '@/assets/utils/useDoctorsMap'

const { loading, error, initializeMap } = useDoctorsMap()

onMounted(() => {
  initializeMap('map')
})
</script>

<style src="@/assets/css/AppPage.css"></style>
