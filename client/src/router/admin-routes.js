import api from "../api/api"
import redir from "@/redirectToUrl"

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
                redir.checkError(to, next, error)
            }
        },
        children: [
            {
                path: "",
                name: "admin-dashboard.home",
                component: () => import("../components/admin-dashboard/Home"),
            },
            {
                path: "faculties",
                name: "admin-dashboard.faculties",
                component: () => import("../components/admin-dashboard/FacultyManager"),
            },
            {
                path: "years",
                name: "admin-dashboard.years",
                component: () => import("../components/admin-dashboard/YearManager"),
            },
            {
                path: "banner",
                name: "admin-dashboard.banner",
                component: () => import("../components/admin-dashboard/BannerManager"),
            },
            {
                path: "calendar",
                name: "admin-dashboard.calendar",
                component: () => import("../components/admin-dashboard/Calendar"),
            },
        ],
    },
]
