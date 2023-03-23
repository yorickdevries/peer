import Vue from "vue"
import VueRouter from "vue-router"
import StudentRoutes from "./student-routes"
import TeacherRoutes from "./teacher-routes"
import TeachingAssistantRoutes from "./teaching-assistant-routes"
import AdminRoutes from "./admin-routes"
import api from "@/api/api"
Vue.use(VueRouter)

/**
 * Naming convention for routes:
 * Name of a route: use a '.' to indicate the route is a child of another route
 * Path of a route: use '-' for any multi-word URL parts
 */

export default new VueRouter({
    mode: "history",
    routes: [
        {
            path: "/",
            name: "general",
            redirect: { name: "landing-page" },
            component: () => import("../components/general/Layout"),
            children: [
                {
                    path: "/",
                    name: "landing-page",
                    component: () => import("../components/general/LandingPage"),
                    beforeEnter: async (to, from, next) => {
                        const res = await api.getAuthenticated()
                        const authenticated = res.data.authenticated

                        if (authenticated) {
                            const item = localStorage.getItem("peerOrigPage")
                            if (item) {
                                localStorage.removeItem("peerOrigPage")
                                next(item)
                            } else {
                                next("/courses")
                            }
                        } else {
                            next()
                        }
                    },
                },
                {
                    path: "/courses",
                    name: "courses",
                    component: () => import("../components/general/Courses"),
                },
                {
                    path: "/privacy",
                    name: "privacy-statement",
                    component: () => import("../components/general/PrivacyPolicy"),
                },
            ],
        },
        ...StudentRoutes,
        ...TeacherRoutes,
        ...TeachingAssistantRoutes,
        ...AdminRoutes,
        { path: "*", redirect: "/404" },
        { path: "/404", component: () => import("../components/404") },
    ],
})
