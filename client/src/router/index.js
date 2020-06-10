import Vue from "vue"
import Router from "vue-router"
import StudentRoutes from "./student-routes"
import TeacherRoutes from "./teacher-routes"
import TeachingAssistantRoutes from "./teaching-assistant-routes"
Vue.use(Router)

/**
 * Naming convention for routes:
 * Name of a route: use a '.' to indicate the route is a child of another route
 * Path of a route: use '-' for any multi-word URL parts
 */

export default new Router({
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
                    component: () => import("../components/general/LandingPage")
                },
                {
                    path: "/courses",
                    name: "courses",
                    component: () => import("../components/general/Courses")
                },
                {
                    path: "/privacy",
                    name: "privacy-statement",
                    component: () => import("../components/general/PrivacyPolicy")
                }
            ]
        },
        ...StudentRoutes,
        ...TeacherRoutes,
        ...TeachingAssistantRoutes,
        { path: "*", redirect: "/404" },
        { path: "/404", component: () => import("../components/404") }
    ]
})
