import client from "./axiosClient"

export default {
    get() {
        return client.get("preferences/")
    },
    post(data) {
        return client.post(`preferences/`, { items: data })
    },
}
