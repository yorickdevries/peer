export default [
    {
        path: '/teacher-dashboard',
        name: 'teacher-dashboard',
        component: () => import('../components/teacher-dashboard/Layout'),
        children: [
            {
                path: 'courses/:id',
                name: 'teacher-dashboard.course',
                component: () => import('../components/teacher-dashboard/Course')
            },
            {
                path: 'courses/:id/edit',
                name: 'teacher-dashboard.course.edit',
                component: () => import('../components/teacher-dashboard/courses/EditCourse')
            },
            {
                path: 'create',
                name: 'teacher-dashboard.courses.create',
                component: () => import('../components/teacher-dashboard/courses/CreateCourse')
            },
            {
                path: 'courses/:id/assignments',
                name: 'teacher-dashboard.assignments',
                component: () => import('../components/teacher-dashboard/Assignments')
            },
            {
                path: 'courses/:id/create-assignment',
                name: 'teacher-dashboard.assignments.create',
                component: () => import('../components/teacher-dashboard/assignments/CreateAssignment')
            },
            {
                path: 'rubric',
                name: 'rubric-wizard',
                component: () => import('../components/teacher-dashboard/rubric/RubricWizard')
            }
        ]
    }
]