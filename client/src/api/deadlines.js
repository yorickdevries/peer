import client from "./axiosClient"

export default {
    getDeadlines() {
        return client.get(`deadlines/assignment`)
    }
}
