import axios from "axios"

const client = axios.create({
    baseURL: "/api/courses/",
    json: true
})

export default {
    getEnrollableCourses() {
        return client.get("enrollable")
    },
    getCourse(courseId) {
        return client.get(`${courseId}`)
    },
    getCourseRole(courseId) {
        return client.get(`${courseId}/enrollment`)
    },
    getCourseUnenrolledAssignmentsAsStudent(courseId) {
        return client.get(`${courseId}/enrollableassignments`)
    },
    getCourseEnrolledAssignmentsAsStudent(courseId) {
        return client.get(`${courseId}/enrolledassignments`)
    },
    enrollInCourse(courseId) {
        return client.post(`${courseId}/enroll`)
    },
    createCourse(course) {
        return client.post("", course)
    }
}
