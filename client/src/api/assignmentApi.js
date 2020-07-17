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
    getLatestSubmissionAsStudent(assignmentId, groupId) {
        return client.get(`${assignmentId}/latestsubmission`, { params: { groupId: groupId } })
    },
    enrollInAssignment(assignmentId) {
        return client.post(`${assignmentId}/enroll`)
    }
}
