export default [
    {
        path: '/teaching-assistant-dashboard/courses/:courseId',
        name: 'teaching-assistant-dashboard.course',

        redirect: {name: 'teaching-assistant-dashboard.course.home'},

        component: () => import('../components/teaching-assistant-dashboard/Layout'),
        children: [
            {
                path: '',
                name: 'teaching-assistant-dashboard.course.home',
                component: () => import('../components/teaching-assistant-dashboard/Course'),
            },
            {
                path: 'assignment/:assignmentId',
                name: 'teaching-assistant-dashboard.course.assignment',
                component: () => import('../components/teaching-assistant-dashboard/Assignment')
            }
        ]
    },
]