import client from "./axiosClient"

export default {
    get(id) {
        return client.get(`uploadquestions/${id}`)
    },
    post(text, number, optional, questionnaireId, extensions) {
        const body = { text, number, optional, questionnaireId, extensions }
        return client.post("uploadquestions/", body)
    },
    patch(id, text, number, optional, extensions) {
        const body = { text, number, optional, extensions }
        return client.patch(`uploadquestions/${id}`, body)
    },
    delete(id) {
        return client.delete(`uploadquestions/${id}`)
    }
}
