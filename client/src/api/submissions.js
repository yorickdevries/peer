import client from "./axiosClient"

export default {
    get(id) {
        return client.get(`submissions/${id}`)
    },
    getAllForAssignment(assignmentId) {
        const params = { assignmentId }
        return client.get("submissions", { params: params })
    },
    getFinal(assignmentId) {
        const params = { assignmentId }
        return client.get("submissions/final", { params: params })
    },
    getFeedback(id) {
        return client.get(`submissions/${id}/feedback`)
    },
    post(groupId, assignmentId, file, config) {
        // Create formData and append data
        const formData = new FormData()
        formData.append("groupId", groupId)
        formData.append("assignmentId", assignmentId)
        formData.append("file", file)
        return client.post("submissions", formData, config)
    }
}
