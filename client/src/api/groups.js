import client from "./axiosClient"

export default {
    getAllForAssignment(assignmentId) {
        const params = { assignmentId }
        return client.get("groups", { params: params })
    },
    get(id) {
        return client.get(`groups/${id}`)
    },
    post(assignmentId, name) {
        const body = { assignmentId, name }
        return client.post("groups", body)
    },
    delete(id) {
        return client.delete(`groups/${id}`)
    },
    addUser(groupId, userNetid) {
        const body = { userNetid }
        return client.patch(`groups/${groupId}/adduser`, body)
    },
    removeUser(groupId, userNetid) {
        const body = { userNetid }
        return client.patch(`groups/${groupId}/removeuser`, body)
    },
    import(assignmentId, file) {
        // Create formData and append data
        const formData = new FormData()
        formData.append("assignmentId", assignmentId)
        formData.append("file", file)
        return client.post("groups/import", formData)
    },
    copy(assignmentId, copyFromAssignmentId) {
        const body = { assignmentId, copyFromAssignmentId }
        return client.post("groups/copy", body)
    }
}
