<template>
  <div id="app-page">
    <h1 class="title">Doctors Near You</h1>
    <ul class="doctor-list">
      <li v-for="doctor in doctors" :key="doctor.id">
        <h3>{{ doctor.Name }}</h3>
        <p>Specialty: {{ doctor.Specialty }}</p>

      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const doctors = ref([]); // Reactive variable to store doctors' data

// Fetch doctors' data on component mount
onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:8080/doctors'); // Replace with your API URL
    console.log(response.data)
    doctors.value = response.data; // Store response data in `doctors`
  } catch (error) {
    console.error('Error fetching doctors:', error);
  }
});
</script>

<style scoped>
#app-page {
  padding: 2rem;
}

.title {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.doctor-list {
  list-style: none;
  padding: 0;
}

.doctor-list li {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style>
