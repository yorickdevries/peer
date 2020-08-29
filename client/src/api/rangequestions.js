import client from "./axiosClient"

export default {
    get(id) {
        return client.get(`rangequestions/${id}`)
    },
    post(text, number, optional, questionnaireId, range) {
        const body = { text, number, optional, questionnaireId, range }
        return client.post("rangequestions/", body)
    },
    patch(id, text, number, optional, range) {
        const body = { text, number, optional, range }
        return client.patch(`rangequestions/${id}`, body)
    },
    delete(id) {
        return client.delete(`rangequestions/${id}`)
    }
}
