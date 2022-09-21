import client from "./axiosClient"

export default {
    get(id) {
        return client.get(`checkboxquestions/${id}`)
    },
    post(text, number, optional, questionnaireId, graded) {
        const body = { text, number, optional, questionnaireId, graded }
        return client.post("checkboxquestions/", body)
    },
    patch(id, text, number, optional, graded) {
        const body = { text, number, optional, graded }
        return client.patch(`checkboxquestions/${id}`, body)
    },
    delete(id) {
        return client.delete(`checkboxquestions/${id}`)
    }
}
