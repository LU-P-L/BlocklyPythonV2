import { createRouter, createWebHistory } from 'vue-router'
import BasicView from "@/views/BasicView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: BasicView
    }
  ]
})

export default router
