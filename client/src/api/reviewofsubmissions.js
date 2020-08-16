import client from "./axiosClient"

export default {
    get(assignmentId, submitted) {
        const params = { assignmentId, submitted }
        return client.get("reviewofsubmissions", { params: params })
    },
    distribute(assignmentId) {
        const params = { assignmentId }
        return client.post("reviewofsubmissions/distribute", null, { params: params })
    }
}
