import client from "./axiosClient"

export default {
    get(id) {
        return client.get(`multiplechoicequestions/${id}`)
    },
    post(text, number, optional, questionnaireId) {
        const body = { text, number, optional, questionnaireId }
        return client.post("multiplechoicequestions/", body)
    },
    patch(id, text, number, optional) {
        const body = { text, number, optional }
        return client.patch(`multiplechoicequestions/${id}`, body)
    },
    delete(id) {
        return client.delete(`multiplechoicequestions/${id}`)
    }
}
