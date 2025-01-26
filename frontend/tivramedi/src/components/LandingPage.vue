<template>
  <div id="landing-page">
    <div class="content">
      <h1 class="title">Welcome to TivraMedi</h1>
      <button class="explore-btn" @click="navigateToApp">Explore</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function navigateToApp() {
  router.push('/app'); // Navigate to the /app route
}
</script>

<style src="@/assets/LandingPage.css"></style>
