import client from "./axiosClient"

export default {
    get() {
        return client.get("faculties/")
    }
}
