import client from "./axiosClient"

export default {
    assignments: {
        get(assignmentId, chart) {
            const params = { chartType: chart }
            return client.get(`statistics/assignment/${assignmentId}`, { params: params })
        }
    }
}
