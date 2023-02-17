import client from "./axiosClient"

export default {
    get() {
        return client.get("preferences/")
    },
    post(name, value) {
        const data = { name, value }
        return client.post(`preferences/`, data)
    },
}
