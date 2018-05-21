export default [
    {
        path: '/student-dashboard',
        name: 'student-dashboard',
        redirect: { name: 'courses'},
        component: () => import('../components/student-dashboard/Layout'),
        children: [
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
    }
]