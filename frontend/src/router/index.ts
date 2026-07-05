import { createRouter, createWebHashHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true },
    },
    // 管理员页面
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('../views/admin/UsersView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/settings',
      name: 'admin-settings',
      component: () => import('../views/admin/SettingsView.vue'),
      meta: { requiresAuth: true },
    },
    // 自习室管理
    {
      path: '/study-rooms',
      name: 'study-rooms',
      component: () => import('../views/study-room/StudyRoomManagementView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/study-rooms/:roomId/seats',
      name: 'study-room-seats',
      component: () => import('../views/study-room/SeatManagementView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/study-rooms/reserve',
      name: 'study-room-reserve',
      component: () => import('../views/study-room/SeatReservationView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/study-rooms/my-reservations',
      name: 'my-reservations',
      component: () => import('../views/study-room/MyReservationsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/study-rooms/admin-reservations',
      name: 'admin-reservations',
      component: () => import('../views/study-room/AdminReservationsView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

/**
 * 全局前置守卫 —— 每次路由跳转前执行
 *
 * 逻辑：
 * 1. 目标页需要登录（meta.requiresAuth）且没有 Token → 重定向到 /login
 * 2. 已登录用户访问 /login → 重定向到 /home（避免重复登录）
 * 3. 其他情况 → 正常放行
 */
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  // 目标页需要登录，但没有 Token → 去登录页
  if (to.meta.requiresAuth && !token) {
    ElMessage.warning('请先登录')
    next('/login')
    return
  }

  // 已登录，访问登录页 → 直接去首页
  if (to.path === '/login' && token) {
    next('/home')
    return
  }

  next()
})

export default router
