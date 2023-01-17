import client from "./axiosClient"

export default {
    get() {
        return client.get("banners")
    },
    getActive() {
        return client.get("banners/active", { bypass: true })
    },
    getById(id) {
        return client.get(`banners/${id}`)
    },
    delete(id) {
        return client.delete(`banners/${id}`)
    },
    post(banner) {
        const data = { title: banner.title, text: banner.text, active: banner.active }
        return client.post("banners", data)
    },
    patch(banner) {
        const data = { title: banner.title, text: banner.text, active: banner.active }
        return client.patch(`banners/${banner.id}`, data)
    },
}
