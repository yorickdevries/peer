export default [
    {
        path: '/student-dashboard/courses/:courseId',
        name: 'student-dashboard.course',
        redirect: {name: 'student-dashboard.course.home'},
        component: () => import('../components/student-dashboard/Layout'),
        children: [
            {
                path: '',
                name: 'student-dashboard.course.home',
                component: () => import('../components/student-dashboard/Course'),
            },
            {
                path: 'assignments',
                name: 'student-dashboard.course.assignments',
                component: () => import('../components/student-dashboard/Assignments')
            },
            {
                path: 'assignment/:assignmentId',
                name: 'student-dashboard.course.assignment',
                redirect: 'assignment/:assignmentId/hand-in',
                component: () => import('../components/student-dashboard/Assignment'),
                children: [
                    {
                        path: 'hand-in',
                        name: 'student-dashboard.course.assignment.hand-in',
                        component: () => import('../components/student-dashboard/assignment/HandIn')
                    },
                    {
                        path: 'peer-review',
                        name: 'student-dashboard.course.assignment.peer-review',
                        component: () => import('../components/student-dashboard/assignment/PeerReviewList'),
                    },
                    {
                        path: 'feedback',
                        name: 'student-dashboard.course.assignment.feedback',
                        component: () => import('../components/student-dashboard/assignment/Feedback')
                    }
                ]
            }
        ]
    }
]