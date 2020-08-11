import axios from "axios"
import { succesInterceptor, errorInterceptor } from "./axiosInterceptors"

const client = axios.create({
    baseURL: "/api/assignments/",
    json: true
})
// Add a response interceptor
client.interceptors.response.use(succesInterceptor, errorInterceptor)

export default {
    getAssignment(assignmentId) {
        return client.get(`${assignmentId}`)
    },
    getCourseAssignments(courseId) {
        return client.get(`?courseId=${courseId}`)
    },
    getGroupAsStudent(assignmentId) {
        return client.get(`${assignmentId}/group`)
    },
    getLatestSubmissionAsStudent(assignmentId, groupId) {
        return client.get(`${assignmentId}/latestsubmission`, { params: { groupId: groupId } })
    },
    enrollInAssignment(assignmentId) {
        return client.post(`${assignmentId}/enroll`)
    },
    async createAssignment(assignment) {
        return client.post("", assignment)
    },
    saveAssignment(assignmentId, formData) {
        // let coursePatch = {
        //     name: course.name,
        //     courseCode: course.courseCode,
        //     enrollable: course.enrollable,
        //     facultyName: course.faculty.name,
        //     academicYearName: course.academicYear.name,
        //     description: course.description
        // }
        return client.patch(`${assignmentId}`, formData)
    }
}
