import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/Login.vue')
        },
        {
            path: '/',
            name: 'Dashboard',
            component: () => import('@/views/Dashboard.vue'),
            redirect: '/qa',
            children: [
                {
                    path: '/qa',
                    name: 'QaList',
                    component: () => import('@/views/qa/QaList.vue')
                },
                {
                    path: '/qa/create',
                    name: 'QaCreate',
                    component: () => import('@/views/qa/QaEdit.vue')
                },
                {
                    path: '/qa/edit/:id',
                    name: 'QaEdit',
                    component: () => import('@/views/qa/QaEdit.vue')
                },
                {
                    path: '/categories',
                    name: 'Categories',
                    component: () => import('@/views/category/CategoryList.vue')
                },
                {
                    path: '/documents',
                    name: 'Documents',
                    component: () => import('@/views/document/DocumentList.vue')
                }
            ]
        }
    ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    if (to.path !== '/login' && !token) {
        next('/login')
    } else if (to.path === '/login' && token) {
        next('/')
    } else {
        next()
    }
})

export default router
