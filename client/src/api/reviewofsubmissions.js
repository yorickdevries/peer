import client from "./axiosClient"

export default {
    get(id) {
        return client.get(`reviewofsubmissions/${id}`)
    },
    getFileMetadata(id) {
        return client.get(`reviewofsubmissions/${id}/filemetadata`)
    },
    patch(id, submitted, flaggedByReviewer) {
        const body = { submitted, flaggedByReviewer }
        return client.patch(`reviewofsubmissions/${id}`, body)
    },
    getEvaluation(id) {
        return client.get(`reviewofsubmissions/${id}/evaluation`)
    },
    postEvaluation(id) {
        return client.post(`reviewofsubmissions/${id}/evaluation`)
    },
    setApproval(id, approvalByTA) {
        const body = { approvalByTA }
        return client.patch(`reviewofsubmissions/${id}/approval`, body)
    },
    submitAll(assignmentId) {
        const params = { assignmentId }
        return client.patch("reviewofsubmissions/submitall", null, { params: params })
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
