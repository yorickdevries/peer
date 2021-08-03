import client from "./axiosClient"

export default {
    get(id) {
        return client.get(`multiplechoicequestions/${id}`)
    },
    post(text, number, optional, questionnaireId, graded) {
        const body = { text, number, optional, questionnaireId, graded }
        return client.post("multiplechoicequestions/", body)
    },
    patch(id, text, number, optional, graded) {
        const body = { text, number, optional, graded }
        return client.patch(`multiplechoicequestions/${id}`, body)
    },
    delete(id) {
        return client.delete(`multiplechoicequestions/${id}`)
    }
}
