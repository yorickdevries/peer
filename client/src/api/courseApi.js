import axios from "axios"

const client = axios.create({
    baseURL: "/api/courses/",
    json: true
})

export default {
    getEnrollableCourses() {
        return client.get("enrollable")
    },
    getCourseRole(courseId) {
        return client.get(`${courseId}/enrollment`)
    },
    getEnrollableAssignmentsAsStudent(courseId) {
        return client.get(`${courseId}/enrollableassignments`)
    },
    getEnrolledAssignmentsAsStudent(courseId) {
        return client.get(`${courseId}/enrolledassignments`)
    },
    enrollInCourse(courseId) {
        return client.post(`${courseId}/enroll`)
    }
}
