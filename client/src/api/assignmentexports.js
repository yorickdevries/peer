import client from "./axiosClient"

export default {
    get(assignmentId) {
        const params = { assignmentId }
        return client.get(`assignmentexports`, { params: params })
    }
}
