import client from "./axiosClient"

export default {
    get(id) {
        return client.get(`submissions/${id}`)
    },
    getAllForAssignmentVersion(assignmentVersionId) {
        const params = { assignmentVersionId }
        return client.get("submissions", { params: params })
    },
    getFeedback(id) {
        return client.get(`submissions/${id}/feedback`)
    },
    post(groupId, assignmentVersionId, file, config) {
        // Create formData and append data
        const formData = new FormData()
        formData.append("groupId", groupId)
        formData.append("assignmentVersionId", assignmentVersionId)
        formData.append("file", file)
        return client.post("submissions", formData, config)
    },
    patch(id, final) {
        const body = { final: final }
        return client.patch(`submissions/${id}`, body)
    },
    setApproval(id, approvalByTA, commentByTA) {
        // set to null in case of empty string
        if (!commentByTA) {
            commentByTA = null
        }
        const body = { approvalByTA, commentByTA }
        return client.patch(`submissions/${id}/approval`, body)
    },
    export(assignmentVersionId, exportType) {
        const params = { assignmentVersionId, exportType }
        return client.post("submissions/export", null, { params: params })
    },
    import(assignmentVersionId, file) {
        // Create formData and append data
        const formData = new FormData()
        formData.append("assignmentVersionId", assignmentVersionId)
        formData.append("file", file)
        return client.post("submissions/import", formData)
    }
}
