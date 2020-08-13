import client from "./axiosClient"

export default {
    get(id) {
        return client.get(`checkboxquestions/${id}`)
    },
    post(text, number, optional, questionnaireId) {
        const body = { text, number, optional, questionnaireId }
        return client.post("checkboxquestions/", body)
    },
    patch(id, text, number, optional) {
        const body = { text, number, optional }
        return client.patch(`checkboxquestions/${id}`, body)
    },
    delete(id) {
        return client.delete(`checkboxquestions/${id}`)
    }
}
