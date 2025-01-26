import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '@/components/LandingPage.vue';
import AppPage from '@/components/AppPage.vue';

const routes = [
    { path: '/', component: LandingPage },
    { path: '/app', component: AppPage }, // New route
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
