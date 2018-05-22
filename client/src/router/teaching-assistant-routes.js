export default [
    {
        path: '/teaching-assistant-dashboard',
        name: 'teaching-assistant-dashboard',
        component: () => import('../components/teaching-assistant-dashboard/Layout'),
        children: [
            {
                path: 'courses/:id',
                name: 'teaching-assistant-dashboard.course',
                component: () => import('../components/teaching-assistant-dashboard/Course')
            },
        ]
    },
]