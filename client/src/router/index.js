import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'LandingPage',
            component: () => import('../components/LandingPage')
        },
        {
            path: '/dashboard',
            name: 'StudentDashboardCourses',
            component: () => import('../components/student-dashboard/StudentDashboardLayout'),
            children: [
                {
                    path: '',
                    name: 'StudentDashboardMain',
                    component: () => import('../components/student-dashboard/StudentDashboardMainPage')
                },
                {
                    path: 'courses',
                    name: 'StudentDashboardCourses',
                    component: () => import('../components/student-dashboard/StudentDashboardCourses')
                },
                {
                    path: 'courses/:id',
                    name: 'StudentDashboardCourse',
                    component: () => import('../components/student-dashboard/StudentDashboardCourse')
                },
                {
                    path: 'assignment/:id',
                    name: 'StudentDashboardAssignment',
                    redirect: 'assignment/:id/hand-in',
                    component: () => import('../components/student-dashboard/StudentDashboardAssignment'),
                    children: [
                        {
                            path: 'hand-in',
                            name: 'HandIn',
                            component: () => import('../components/student-dashboard/student-dashboard-assignment/HandIn')
                        },
                        {
                            path: 'peer-review',
                            name: 'PeerReview',
                            component: () => import('../components/student-dashboard/student-dashboard-assignment/PeerReviewNavigator')
                        },
                        {
                            path: 'feedback',
                            name: 'Feedback',
                            component: () => import('../components/student-dashboard/student-dashboard-assignment/Feedback')
                        }
                    ]
                }
            ]
        }
    ]
})