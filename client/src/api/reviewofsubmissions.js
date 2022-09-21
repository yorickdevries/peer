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
    setApproval(id, approvalByTA, commentByTA) {
        // set to null in case of empty string
        if (!commentByTA) {
            commentByTA = null
        }
        const body = { approvalByTA, commentByTA }
        return client.patch(`reviewofsubmissions/${id}/approval`, body)
    },
    openFeedback(assignmentId) {
        const params = { assignmentId }
        return client.patch("reviewofsubmissions/openfeedback", null, { params: params })
    },
    getAnswers(id) {
        return client.get(`reviewofsubmissions/${id}/answers`)
    },
    getAllForAssignmentVersion(assignmentVersionId, submitted) {
        const params = { assignmentVersionId, submitted }
        return client.get("reviewofsubmissions", { params: params })
    },
    distribute(assignmentId) {
        const params = { assignmentId }
        return client.post("reviewofsubmissions/distribute", null, { params: params })
    },
    exportReviews(assignmentVersionId, exportType) {
        const params = { assignmentVersionId, exportType }
        return client.post("reviewofsubmissions/exportreviews", null, { params: params })
    },
    exportGrades(assignmentVersionId, exportType) {
        const params = { assignmentVersionId, exportType }
        return client.post("reviewofsubmissions/exportgrades", null, { params: params })
    }
}
