import client from "./axiosClient"

export default {
    import(assignmentId, file) {
        // Create formData and append data
        const formData = new FormData()
        formData.append("assignmentId", assignmentId)
        formData.append("file", file)
        return client.post("groups/import", formData)
    }
}
