import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

/**
 * Naming convention for routes:
 * Name of a route: use a '.' to indicate the route is a child of another route
 * Path of a route: use '-' for any multi-word URL parts
 */

export default new Router({
    routes: [
        {
            path: '/',
            name: 'landing-page',
            component: () => import('../components/landing-page/Index')
        },
        {
            path: '/student-dashboard',
            name: 'student-dashboard',
            component: () => import('../components/student-dashboard/Layout'),
            children: [
                {
                    path: '',
                    name: 'student-dashboard.index',
                    component: () => import('../components/student-dashboard/Index')
                },
                {
                    path: 'courses',
                    name: 'student-dashboard.courses',
                    component: () => import('../components/student-dashboard/Courses')
                },
                {
                    path: 'courses/:id',
                    name: 'student-dashboard.course',
                    component: () => import('../components/student-dashboard/Course')
                },
                {
                    path: 'assignment/:id',
                    name: 'student-dashboard.assignment',
                    redirect: 'assignment/:id/hand-in',
                    component: () => import('../components/student-dashboard/Assignment'),
                    children: [
                        {
                            path: 'hand-in',
                            name: 'student-dashboard.assignment.hand-in',
                            component: () => import('../components/student-dashboard/assignment/HandIn')
                        },
                        {
                            path: 'peer-review',
                            name: 'student-dashboard.assignment.peer-review',
                            component: () => import('../components/student-dashboard/assignment/PeerReviewNavigator')
                        },
                        {
                            path: 'feedback',
                            name: 'student-dashboard.assignment.feedback',
                            component: () => import('../components/student-dashboard/assignment/FeedbackNavigator')
                        }
                    ]
                }
            ]
        },
        {
            path: '/teaching-assistant-dashboard',
            name: 'teaching-assistant-dashboard',
            component: () => import('../components/teaching-assistant-dashboard/Layout'),
            children: [
                {
                    path: '',
                    name: 'teaching-assistant-dashboard.index',
                    component: () => import('../components/teaching-assistant-dashboard/Index')
                }
            ]
        },
        {
            path: '/teacher-dashboard',
            name: 'teacher-dashboard',
            component: () => import('../components/teacher-dashboard/Layout')
        }
    ]
})