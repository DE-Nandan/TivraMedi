<template>
  <div id="app-page">
    <h1 class="title">Doctors Near You</h1>
    <div v-if="loading" class="loading">Loading map...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div id="map-container" v-else></div>
  </div>
</template>

<script setup>

import { onMounted } from 'vue';
import useDoctorsMap from '@/assets/utils/useDoctorsMap';

const { loading, error, initializeMap } = useDoctorsMap();

onMounted(() => {
  initializeMap('map-container');
});

</script>

<style src="@/assets/css/AppPage.css"></style>
