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
                redirect: {name: 'student-dashboard.course.assignments'},
            },
            {
                path: 'assignments',
                name: 'student-dashboard.course.assignments',
                component: () => import('../components/student-dashboard/Assignments')
            },
            {
                path: 'assignment/:assignmentId',
                name: 'student-dashboard.course.assignment',
                redirect: 'assignment/:assignmentId/information',
                component: () => import('../components/student-dashboard/Assignment'),
                children: [
                    {
                        path: 'information',
                        name: 'student-dashboard.course.assignment.information',
                        component: () => import('../components/student-dashboard/assignment/Information')
                    },
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
                    },
                    {
                        path: 'review-evaluation',
                        name: 'student-dashboard.course.assignment.review-evaluation',
                        component: () => import('../components/student-dashboard/assignment/ReviewEvaluationList')
                    }
                ]
            }
        ]
    }
]