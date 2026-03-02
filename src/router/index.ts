import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home1',
      component: () => import('../views/HomeEnterpriseView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/services',
      name: 'services',
      component: () => import('../views/ServicesView.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue'),
    },
    {
      path: '/home',
      name: 'home2',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/transaction',
      name: 'transaction',
      component: () => import('../views/AddTransactionView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
    },
    {
      path: '/edit-transaction/:id',
      name: 'edit-transaction',
      component: () => import('../views/EditTransactionView.vue'),
      props: true,
    },
    {
      path: '/book',
      name: 'book',
      component: () => import('../views/BookView.vue'),
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('../views/NotificationsView.vue'),
    },
    {
      path: '/home/editAccount',
      name: 'edit',
      component: () => import('../views/EditAccountView.vue'),
    },
    {
      path: '/home/contributions/:objectiveId?',
      name: 'ObjectiveContributions',
      component: () => import('../views/ObjectiveContributionsView.vue'),
      props: true,
    },
  ],
})

export default router
