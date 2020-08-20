import client from "./axiosClient"

export default {
    get(id) {
        return client.get(`openquestions/${id}`)
    },
    post(text, number, optional, questionnaireId) {
        const body = { text, number, optional, questionnaireId }
        return client.post("openquestions/", body)
    },
    patch(id, text, number, optional) {
        const body = { text, number, optional }
        return client.patch(`openquestions/${id}`, body)
    },
    delete(id) {
        return client.delete(`openquestions/${id}`)
    }
}
