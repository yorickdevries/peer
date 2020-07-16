import axios from "axios"

const client = axios.create({
    baseURL: "/api/assignments/",
    json: true
})

export default {
    getAssignment(assignmentId) {
        return client.get(`${assignmentId}`)
    },
    getGroupAsStudent(assignmentId) {
        return client.get(`${assignmentId}/group`)
    },
    getLatestSubmissionAsStudent(assignmentId) {
        return client.get(`${assignmentId}/latestsubmission`)
    },
    enrollInAssignment(assignmentId) {
        return client.post(`${assignmentId}/enroll`)
    }
}
