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
                path: 'courses/:courseId/assignments/:assignmentId/reviews/:reviewId',
                name: 'teacher-dashboard.assignments.assignment.review',
                component: () => import('../components/ta_teacher_shared/ReviewApproval')
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
            {
                path: 'courses/:courseId/teachers',
                name: 'teacher-dashboard.course.teachers',
                component: () => import('../components/teacher-dashboard/TeacherManager')
            },
            {
                path: 'courses/:courseId/students',
                name: 'teacher-dashboard.course.students',
                component: () => import('../components/teacher-dashboard/StudentManager')
            },
        ]
    }
]