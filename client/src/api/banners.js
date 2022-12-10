import client from "./axiosClient"

export default {
    get(active) {
        const params = { active: active }
        return client.get("banner/", { params: params })
    },
    getById(id) {
        return client.get(`banner/${id}`)
    },
    delete(id) {
        return client.delete(`banner/${id}`)
    },
    post(year) {
        return client.post("banner", year)
    },
    patch(year) {
        const data = { name: year.name, active: year.active }
        return client.patch(`banner/${year.id}`, data)
    }
}
