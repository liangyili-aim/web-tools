import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import EmailChecker from './views/EmailChecker.vue'
import IpChecker from './views/IpChecker.vue'
import PwdGenerator from './views/PwdGenerator.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/email-checker',
    name: 'EmailChecker',
    component: EmailChecker
  },
  {
    path: '/ip-checker',
    name: 'IpChecker',
    component: IpChecker
  },
  {
    path: '/pwd-generator',
    name: 'PwdGenerator',
    component: PwdGenerator
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
