import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'
import AppPage from '@/views/AppPage.vue'
import SymptomCheck from '../views/SymptomCheck.vue'

const routes = [
  { path: '/', component: LandingPage },
  { path: '/map', component: AppPage }, // New route
  {
    path: '/symptom-check',
    name: 'SymptomCheck',
    component: SymptomCheck,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
