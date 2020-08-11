import axios from "axios"
import { succesInterceptor, errorInterceptor } from "./axiosInterceptors"

const client = axios.create({
    baseURL: "/api/courses/",
    json: true
})
// Add a response interceptor
client.interceptors.response.use(succesInterceptor, errorInterceptor)

export default {
    getEnrollable() {
        return client.get("enrollable")
    },
    // getCourse(courseId) {
    //     return client.get(`${courseId}`)
    // },
    // getCourseRole(courseId) {
    //     return client.get(`${courseId}/enrollment`)
    // },
    // getCourseUnenrolledAssignmentsAsStudent(courseId) {
    //     return client.get(`${courseId}/enrollableassignments`)
    // },
    // getCourseEnrolledAssignmentsAsStudent(courseId) {
    //     return client.get(`${courseId}/enrolledassignments`)
    // },
    enroll(courseId) {
        return client.post(`${courseId}/enroll`)
    }
    // async createCourse(course) {
    //     return client.post("", course)
    // },
    // saveCourse(courseId, course) {
    //     let coursePatch = {
    //         name: course.name,
    //         courseCode: course.courseCode,
    //         enrollable: course.enrollable,
    //         facultyName: course.faculty.name,
    //         academicYearName: course.academicYear.name,
    //         description: course.description
    //     }
    //     return client.patch(`${courseId}`, coursePatch)
    // }
}
