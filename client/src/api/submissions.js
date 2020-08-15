import client from "./axiosClient"

export default {
    post(groupId, assignmentId, file, config) {
        // Create formData and append data
        const formData = new FormData()
        formData.append("groupId", groupId)
        formData.append("assignmentId", assignmentId)
        formData.append("file", file)
        return client.post("submissions", formData, config)
    }
}
