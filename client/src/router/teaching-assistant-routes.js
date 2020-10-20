import api from "../api/api"

export default [
    {
        path: "/teaching-assistant-dashboard/courses/:courseId",
        name: "teaching-assistant-dashboard.course",
        redirect: { name: "teaching-assistant-dashboard.course.home" },
        component: () => import("../components/teaching-assistant-dashboard/Layout"),
        beforeEnter: async (to, from, next) => {
            try {
                const res = await api.courses.enrollment(to.params.courseId)
                const enrollment = res.data
                if (enrollment.role !== "teachingassistant") {
                    throw new Error("Wrong role")
                }
                next()
            } catch (error) {
                //redirect to root
                next("/")
            }
        },
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
            },
            {
                path: "courses/:courseId/assignments/:assignmentId/submissions/:submissionId",
                name: "teacher-dashboard.assignments.assignment.submission",
                component: () => import("../components/ta_teacher_shared/SubmissionApproval")
            }
        ]
    }
]
