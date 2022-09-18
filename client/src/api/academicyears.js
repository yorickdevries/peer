import client from "./axiosClient"

export default {
    get(active) {
        const params = { active: active }
        return client.get("academicyears/", { params: params })
    },
    getById(id) {
        return client.get(`academicyears/${id}`)
    },
    delete(id) {
        return client.delete(`academicyears/${id}`)
    },
    post(year) {
        return client.post("academicyears", year)
    },
    patch(year) {
        return client.patch(`academicyears/${year.id}`, year)
    }
}
