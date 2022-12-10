import client from "./axiosClient"

export default {
    get(active, bypass) {
        const params = { active: active }
        return client.get("banners", { bypass: bypass, params: params })
    },
    getById(id) {
        return client.get(`banners/${id}`)
    },
    delete(id) {
        return client.delete(`banners/${id}`)
    },
    post(banner) {
        return client.post("banners", banner)
    },
    patch(banner) {
        const data = { title: banner.title, text: banner.text, active: banner.active }
        return client.patch(`banners/${banner.id}`, data)
    }
}
