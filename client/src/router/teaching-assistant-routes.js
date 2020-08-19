export default [
    {
        path: "/teaching-assistant-dashboard/courses/:courseId",
        name: "teaching-assistant-dashboard.course",
        redirect: { name: "teaching-assistant-dashboard.course.home" },
        component: () => import("../components/teaching-assistant-dashboard/Layout"),
        children: [
            {
                path: "",
                name: "teaching-assistant-dashboard.course.home",
                component: () => import("../components/teaching-assistant-dashboard/Course")
            },
            {
                path: "assignment/:assignmentId",
                name: "teaching-assistant-dashboard.course.assignment",
                component: () => import("../components/teaching-assistant-dashboard/Assignment")
            },
            {
                path: "assignment/:assignmentId/reviews/:reviewId",
                name: "teaching-assistant-dashboard.course.assignment.review",
                component: () => import("../components/ta_teacher_shared/ReviewApproval")
            }
        ]
    }
]
