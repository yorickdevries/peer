import api from "../api/api"

export default [
    {
        path: "/admin-dashboard",
        name: "admin-dashboard",
        component: () => import("../components/admin-dashboard/Layout"),
        beforeEnter: async (to, from, next) => {
            try {
                const res = await api.getMe()
                const user = res.data
                if (!user.admin) {
                    throw new Error("Not administrator")
                }
                next()
            } catch (error) {
                //redirect to root
                next("/")
            }
        },
        children: [
            {
                path: "faculties",
                name: "admin-dashboard.faculties",
                component: () => import("../components/admin-dashboard/FacultyManager")
            },
            {
                path: "years",
                name: "admin-dashboard.years",
                component: () => import("../components/admin-dashboard/YearManager")
            }
        ]
    }
]
