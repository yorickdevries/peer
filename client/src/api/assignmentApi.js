import axios from "axios"

const client = axios.create({
    baseURL: "/api/assignments/",
    json: true
})

export default {
    client,
    getAssignment(assignmentId) {
        return client.get(`${assignmentId}`)
    },
    getGroupAsStudent(assignmentId) {
        return client.get(`${assignmentId}/group`)
    },
    getLatestSubmissionAsStudent(assignmentId) {
        return client.get(`${assignmentId}/latestsubmission`)
    }
}
