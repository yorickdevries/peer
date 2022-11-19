import client from "./axiosClient"

export default {
    assignments: {
        get(assignmentId, data) {
            const params = { dataType: data }
            return client.get(`statistics/assignment/${assignmentId}`, { params: params })
        }
    }
}
