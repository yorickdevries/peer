export default [
    {
        path: '/teacher-dashboard',
        name: 'teacher-dashboard',
        component: () => import('../components/teacher-dashboard/Layout'),
        children: [
            {
                path: 'courses/:courseId',
                name: 'teacher-dashboard.course',
                component: () => import('../components/teacher-dashboard/Course')
            },
            {
                path: 'courses/:courseId/edit',
                name: 'teacher-dashboard.course.edit',
                component: () => import('../components/teacher-dashboard/courses/EditCourse')
            },
            {
                path: 'create',
                name: 'teacher-dashboard.courses.create',
                component: () => import('../components/teacher-dashboard/courses/CreateCourse')
            },
            {
                path: 'courses/:courseId/assignments',
                name: 'teacher-dashboard.assignments',
                component: () => import('../components/teacher-dashboard/Assignments')
            },
            {
                path: 'courses/:courseId/create-assignment',
                name: 'teacher-dashboard.assignments.create',
                component: () => import('../components/teacher-dashboard/assignments/CreateAssignment')
            },
            {
                path: 'courses/:courseId/assignments/:assignmentId',
                name: 'teacher-dashboard.assignments.assignment',
                component: () => import('../components/teacher-dashboard/assignments/Assignment')
            },
            {
                path: 'courses/:courseId/assignments/:assignmentId/edit',
                name: 'teacher-dashboard.assignments.assignment.edit',
                component: () => import('../components/teacher-dashboard/assignments/EditAssignment')
            },
            {
                path: 'courses/:courseId/teaching-assistants',
                name: 'teacher-dashboard.course.teaching-assistants',
                component: () => import('../components/teacher-dashboard/TAManager')
            },
        ]
    }
]