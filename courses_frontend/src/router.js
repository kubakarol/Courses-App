import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './components/HomePage.vue';
import LoginLayout from './views/LoginLayout.vue';
import RegisterLayout from './views/RegisterLayout.vue';
import CourseDetails from './components/CourseDetails.vue';
import Enrollments from './components/Enrollments.vue';
import Courses from './components/Courses.vue';
import AdminView from './components/AdminView.vue';

const routes = [
  {
    name: 'HomePage',
    component: HomePage,
    path: '/',
    meta: { requiresAuth: true }
  },
  {
    name: 'LoginLayout',
    component: LoginLayout,
    path: '/login',
    meta: { requiresGuest: true }
  },
  {
    name: 'Register',
    component: RegisterLayout,
    path: '/register',
    meta: { requiresGuest: true }
  },
  {
    name: 'CourseDetails',
    component: CourseDetails,
    path: '/coursedetails',
    props: (route) => ({ courseId: route.query.courseId })
  },
  {
    name: 'Enrollments',
    component: Enrollments,
    path: '/enrollments',
    meta: { requiresAuth: true }
  },
  {
    name: 'Courses',
    component: Courses,
    path: '/courses',
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    name: 'AdminView',
    component: AdminView,
    path: '/admin',
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const loggedIn = localStorage.getItem('loggedIn');
  const user = JSON.parse(localStorage.getItem('user'));

  if (to.meta.requiresAuth && !loggedIn) {
    next({ name: 'LoginLayout' });
  } else if (to.meta.requiresGuest && loggedIn) {
    next({ name: 'HomePage' });
  } else {
    if (to.meta.requiresAdmin && user && user.type !== 1) {
      next({ name: 'HomePage' });
    } else {
      next();
    }
  }
});

export default router;
