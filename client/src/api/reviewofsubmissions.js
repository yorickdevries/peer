import client from "./axiosClient"

export default {
    distribute(assignmentId) {
        const params = { assignmentId }
        return client.post("reviewofsubmissions/distribute", null, { params: params })
    }
}
