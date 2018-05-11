import Vue from 'vue'
import Router from 'vue-router'

import LandingPage from '../components/LandingPage'
import StudentDashboardLayout from '../components/StudentDashboardLayout'
import StudentDashboardCourses from '../components/StudentDashboardCourses'
import StudentDashboardMain from '../components/StudentDashboardMain'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'LandingPage',
            component: LandingPage
        },
        {
            path: '/dashboard',
            name: 'StudentDashboardCourses',
            component: StudentDashboardLayout,
            children: [
                {
                    path: '',
                    name: 'StudentDashboardMain',
                    component: StudentDashboardMain
                },
                {
                    path: 'courses',
                    name: 'StudentDashboardCourses',
                    component: StudentDashboardCourses
                }
            ]
        }
    ]
})