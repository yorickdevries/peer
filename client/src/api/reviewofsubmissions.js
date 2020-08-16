import client from "./axiosClient"

export default {
    get(id) {
        return client.get(`reviewofsubmissions/${id}`)
    },
    patch(id, submitted, flaggedByReviewer) {
        const body = { submitted, flaggedByReviewer }
        return client.patch(`reviewofsubmissions/${id}`, body)
    },
    getAnswers(id) {
        return client.get(`reviewofsubmissions/${id}/answers`)
    },
    getAllForAssignment(assignmentId, submitted) {
        const params = { assignmentId, submitted }
        return client.get("reviewofsubmissions", { params: params })
    },
    distribute(assignmentId) {
        const params = { assignmentId }
        return client.post("reviewofsubmissions/distribute", null, { params: params })
    }
}
