import client from "./axiosClient"

export default {
    get(active) {
        const params = { active: active }
        return client.get("academicyears/", { params: params })
    }
}
