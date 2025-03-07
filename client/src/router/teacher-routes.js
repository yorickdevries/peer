import api from "../api/api"
import redir from "@/redirectToUrl"

export default [
    {
        path: "/teacher-dashboard",
        name: "teacher-dashboard",
        component: () => import("../components/teacher-dashboard/Layout"),
        beforeEnter: async (to, from, next) => {
            try {
                const res = await api.courses.enrollment(to.params.courseId)
                const enrollment = res.data
                if (enrollment.role !== "teacher") {
                    throw new Error("Wrong role")
                }
                next()
            } catch (error) {
                redir.checkError(to, next, error)
            }
        },
        children: [
            {
                path: "courses/:courseId",
                name: "teacher-dashboard.course",
                component: () => import("../components/teacher-dashboard/Course"),
            },
            {
                path: "courses/:courseId/statistics",
                name: "teacher-dashboard.course.statistics.home",
                component: () => import("../components/teacher-dashboard/statistics/Layout"),
            },
            {
                path: "courses/:courseId/edit",
                name: "teacher-dashboard.course.edit",
                component: () => import("../components/teacher-dashboard/courses/EditCourse"),
            },
            {
                path: "courses/:courseId/assignments",
                name: "teacher-dashboard.assignments",
                component: () => import("../components/teacher-dashboard/Assignments"),
            },
            {
                path: "courses/:courseId/create-assignment",
                name: "teacher-dashboard.assignments.create",
                component: () => import("../components/teacher-dashboard/assignments/CreateAssignment"),
            },
            {
                path: "courses/:courseId/create-simple-assignment",
                name: "teacher-dashboard.assignments.createSimple",
                component: () => import("../components/teacher-dashboard/assignments/CreateSimpleAssignment.vue"),
            },
            {
                path: "courses/:courseId/assignments/:assignmentId",
                name: "teacher-dashboard.assignments.assignment",
                component: () => import("../components/teacher-dashboard/assignments/Assignment"),
            },
            {
                path: "courses/:courseId/assignments/:assignmentId/reviews/:reviewId",
                name: "teacher-dashboard.assignments.assignment.review",
                component: () => import("../components/ta_teacher_shared/ReviewApproval"),
            },
            {
                path: "courses/:courseId/assignments/:assignmentId/submissions/:submissionId",
                name: "teacher-dashboard.assignments.assignment.submission",
                component: () => import("../components/ta_teacher_shared/SubmissionApproval"),
            },
            {
                path: "courses/:courseId/assignments/:assignmentId/edit",
                name: "teacher-dashboard.assignments.assignment.edit",
                component: () => import("../components/teacher-dashboard/assignments/EditAssignment"),
            },
            {
                path: "courses/:courseId/teachers",
                name: "teacher-dashboard.course.teachers",
                component: () => import("../components/teacher-dashboard/TeacherManager"),
            },
            {
                path: "courses/:courseId/teaching-assistants",
                name: "teacher-dashboard.course.teaching-assistants",
                component: () => import("../components/teacher-dashboard/TAManager"),
            },
            {
                path: "courses/:courseId/students",
                name: "teacher-dashboard.course.students",
                component: () => import("../components/teacher-dashboard/StudentManager"),
            },
        ],
    },
]
