import client from "./axiosClient"

export default {
    get(netid) {
        return client.get(`users/${netid}`)
    }
}
